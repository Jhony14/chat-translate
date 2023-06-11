require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const qs = require('qs');
const mongoose = require('mongoose');

const User = require('./models/User');
const GlobalChat = require('./models/GlobalChat');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', (socket) => {
	socket.on('setUser', async (user) => {
		let existingUser = await User.findOne({ token: user.token });

		if (existingUser) {
			existingUser.name = user.name;
			existingUser.lang = user.lang;
			existingUser.socketId = socket.id; // Update the socketId
			await existingUser.save();
		} else {
			const newUser = new User({
				socketId: socket.id,
				name: user.name,
				lang: user.lang,
				token: user.token,
				chatHistory: []
			});
			await newUser.save();
		}

		// Emit the chat history when the user first connects
		let userWithChat = await User.findOne({ token: user.token });
		if (userWithChat) {
			socket.emit('chat history', userWithChat.chatHistory.map(msgObj => {
				console.log(msgObj);
				return { text: msgObj.text, token: msgObj.sent ? user.token : '' };
			}));
		}

	});

	socket.on('chat message', async (msgObj) => {
		console.log(`Message received: ${msgObj.text}`);
		let originalLang = await detectLanguage(msgObj.text);

		let sender = await User.findOne({ token: msgObj.token });

		if (sender) {
			let chatMsg = sender.name + ': ' + msgObj.text;
			sender.chatHistory.push({ text: chatMsg, sent: true });
			console.log(`Saving message to sender's history: ${chatMsg}`);
			await sender.save();
		}

		let globalChat = await GlobalChat.findOne({});
		if (!globalChat) {
			globalChat = new GlobalChat({ messages: [] });
		}
		globalChat.messages.push(msgObj.text);
		await globalChat.save();

		let users = await User.find({});
		for (let user of users) {
			let translatedMsg = await translateText(msgObj.text, originalLang, user.lang);
			let chatMsg = sender.name + ': ' + translatedMsg;

			if (user.socketId !== sender.socketId) {
				user.chatHistory.push({ text: chatMsg, sent: false });
				await user.save();
			}

			if (user.socketId === socket.id) {
				io.to(user.socketId).emit('chat message', { text: chatMsg, token: msgObj.token });
			} else {
				io.to(user.socketId).emit('chat message', { text: chatMsg, token: '' });
			}
		}
	});


	// socket.on('getChat', async () => {
	// 	console.log('getChat event received, sending chat history');
	// 	let user = await User.findOne({ socketId: socket.id });
	// 	if (user && user.chatHistory) {
	// 		console.log('Found user, sending chat history:', user.chatHistory);
	// 		socket.emit('chat history', user.chatHistory);
	// 	}
	// });

});

(async function startServer() {
	try {
		await mongoose.connect(process.env.DB_HOST, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			user: process.env.DB_USER,
			pass: process.env.DB_PASSWORD
		});
		console.log('MongoDB Connected...');

		server.listen(3000, () => {
			console.log('listening on *:3000');
		});
	} catch (err) {
		console.log(err);
	}
})();

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
