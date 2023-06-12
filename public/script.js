document.addEventListener('DOMContentLoaded', (event) => {
	var socket = io();

	let token = localStorage.getItem('token');
	let name = localStorage.getItem('name');
	let lang = localStorage.getItem('lang');

	if (token) {
		let user = { name, lang, token };
		socket.emit('setUser', user);
		socket.emit('getChat');
		document.getElementById('userForm').style.display = 'none';
		document.getElementById('chat').style.display = 'block';
		document.getElementsByTagName('body')[0].classList.add('chat-mode');
	} else {
		document.querySelector('#userForm button').addEventListener('click', setUser);
	}

	document.querySelector('#chat form').addEventListener('submit', sendMessage);

	function setUser() {
		let user = {
			name: document.getElementById('name').value,
			lang: document.getElementById('lang').value,
			token: Math.random().toString(36).substring(2) + (new Date()).getTime().toString(36)
		};

		if (user.name && user.lang) {
			localStorage.setItem('token', user.token);
			localStorage.setItem('name', user.name);
			localStorage.setItem('lang', user.lang);

			socket.emit('setUser', user);

			document.getElementById('userForm').style.display = 'none';
			document.getElementById('chat').style.display = 'block';
			document.getElementsByTagName('body')[0].classList.add('chat-mode');

			document.getElementById('name').value = '';
			document.getElementById('lang').value = '';
		} else {
			alert('Por favor, rellena el nombre y el idioma');
		}
	}

	function sendMessage(e) {
		e.preventDefault();
		var m = document.getElementById('m');
		socket.emit('chat message', { text: m.value, token: localStorage.getItem('token') });
		m.value = '';
	}

	socket.on('chat message', function (msg) {
		addMessage(msg);
	});

	socket.on('chat history', function (history) {
		for (let msg of history) {
			addMessage({ text: msg.text, token: msg.token });
		}
	});

	function addMessage(msg) {
		var p = document.createElement('p');
		p.textContent = msg.text;

		if (msg.token === localStorage.getItem('token')) {
			p.classList.add('send');
		} else {
			p.classList.add('received');
		}

		var messages = document.getElementById('messages');
		messages.appendChild(p);
		messages.scrollTop = messages.scrollHeight;
	}
});
