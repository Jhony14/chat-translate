const User = require('../models/User');
const GlobalChat = require('../models/GlobalChat');
const { detectLanguage, translateText } = require('../services/translation');

module.exports = function(io) {
	io.on('connection', (socket) => {
		socket.on('setUser', async (user) => {
			let existingUser = await User.findOne({ token: user.token });

			if (existingUser) {
				existingUser.name = user.name;
				existingUser.lang = user.lang;
				existingUser.socketId = socket.id;
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

			let userWithChat = await User.findOne({ token: user.token });
			if (userWithChat) {
				socket.emit('chat history', userWithChat.chatHistory.map(msgObj => {
					return { text: msgObj.text, token: msgObj.sent ? user.token : '' };
				}));
			}
		});

		socket.on('chat message', async (msgObj) => {
			let originalLang = await detectLanguage(msgObj.text);

			let sender = await User.findOne({ token: msgObj.token });

			if (sender) {
				let chatMsg = sender.name + ': ' + msgObj.text;
				sender.chatHistory.push({ text: chatMsg, sent: true });
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
	});
};
