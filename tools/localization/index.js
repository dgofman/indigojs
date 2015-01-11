'use strict';

var mongoose = require('mongoose'),
	indigo = require('../../indigo'),
	cjson = require('cjson');

(function() {
	var appconf = cjson.load(__dirname + '/config/app.json'),
		db = mongoose.connection;

	mongoose.connect('mongodb://localhost/indigoLocales');

	//var db = mongoose.connection;
	db.on('error', function onError(e) {
		console.error('Connection Error to MongoDB:', e);
		startApp(appconf);
	});
	db.once('open', function onSuccess () {
		appconf.mongoDB = true;
		startApp(appconf);
	});
})();

function startApp(appconf) {
	indigo.start(appconf, function(http) {
		var io = require('socket.io').listen(http);
		io.sockets.on('connection', function(socket) {
			socket.on('localize', function(data){
				socket.broadcast.emit('localize', data);
			});
		});
	});
}