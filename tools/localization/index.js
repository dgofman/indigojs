'use strict';

require('../../indigo').start(__appDir + '/tools/localization/config/app.json', function(http) {
	var io = require('socket.io').listen(http);
	io.sockets.on('connection', function(socket) {
		socket.on('localize', function(data){
			socket.broadcast.emit('localize', data);
		});
	});
});