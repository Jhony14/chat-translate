require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const indexRouter = require('./routes/index');
const socketController = require('./controllers/socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use('/', indexRouter);

socketController(io);

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
