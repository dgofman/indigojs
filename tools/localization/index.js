'use strict';

var mongoose = require('mongoose'),
	indigo = require('../../indigo'),
	nconf = require('nconf').
				use('file', { file: __dirname + '/config/app.json' });

(function() {
	mongoose.connect('mongodb://localhost/indigoLocales');

	var db = mongoose.connection;
	db.on('error', function onError(e) {
		console.error('Connection Error to MongoDB:', e);
		startApp(nconf, false);
	});
	db.once('open', function onSuccess () {
		startApp(nconf, true);
	});
})();

function startApp(nconf, isRunning) {
	nconf.set('MongoDB', isRunning);
	indigo.start(nconf, function(http) {
		var io = require('socket.io').listen(http);
		io.sockets.on('connection', function(socket) {
			socket.on('localize', function(data){
				socket.broadcast.emit('localize', data);
			});
		});
	});
}