'use strict';

(function() {

	var mongoose = require('mongoose'),
		indigo = require('../../indigo'),
		nconf = require('nconf').
					use('file', { file: __dirname + '/config/app.json' });

	mongoose.connect('mongodb://localhost/indigoLocales');

	var db = mongoose.connection;
	db.on('error', console.error.bind(console, 'Connection Error:'));
	db.once('open', function callback () {
		indigo.start(nconf, function(http) {
			var io = require('socket.io').listen(http);
			io.sockets.on('connection', function(socket) {
				socket.on('localize', function(data){
					socket.broadcast.emit('localize', data);
				});
			});
		});
	});
})();