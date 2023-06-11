const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
	messages: [String]
});

const GlobalChat = mongoose.model('GlobalChat', chatSchema);

module.exports = GlobalChat;
