'use strict';

var indigo = require('../../indigo');

if (indigo.appconf) {
	initSocketIO();
} else {
	indigo.start(__appDir + '/tools/localization/config/app.json', function() {
		initSocketIO();
	});
}

function initSocketIO() {
	var io = require('socket.io').listen(indigo.http);
	io.sockets.on('connection', function(socket) {
		socket.on('localize', function(data){
			socket.broadcast.emit('localize', data);
		});
	});
}