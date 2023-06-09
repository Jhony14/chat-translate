require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const qs = require('qs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let users = {};
let chats = {};

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
	socket.on('setUser', (user) => {
		users[socket.id] = user;
		chats[socket.id] = [];
	});

	socket.on('getChat', () => {
		let chatHistory = Object.values(chats).flat();
		socket.emit('chat history', chatHistory);
	});

	socket.on('chat message', async (msg) => {
		let originalLang = await detectLanguage(msg);
		for (let id in users) {
			if (users[socket.id]) {
				let translatedMsg = await translateText(msg, originalLang, users[id].lang);
				let chatMsg = users[socket.id].name + ': ' + translatedMsg;
				io.to(id).emit('chat message', chatMsg);
				chats[id].push(chatMsg); // push the message to all users' chat history
			}
		}
	});

	socket.on('disconnect', () => {
		delete users[socket.id];
		delete chats[socket.id];
	});
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});

async function detectLanguage(text) {
	let response = await axios.post('https://api-free.deepl.com/v2/translate', qs.stringify({
		auth_key: process.env.API_TRANSLATE,
		text: text,
		target_lang: 'EN'
	}));
	return response.data.translations[0].detected_source_language;
}

async function translateText(text, originalLang, targetLang) {
	let response = await axios.post('https://api-free.deepl.com/v2/translate', qs.stringify({
		auth_key: process.env.API_TRANSLATE,
		text: text,
		source_lang: originalLang,
		target_lang: targetLang
	}));
	return response.data.translations[0].text;
}
