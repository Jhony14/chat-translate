const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  socketId: String,
  name: String,
  lang: String,
  token: String,
  chatHistory: [{
    text: String,
    sent: Boolean
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
