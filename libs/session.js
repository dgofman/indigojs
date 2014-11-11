'use strict';

var expressSession = require('express-session');

module.exports = function session(nconf) {
	var opts = {
		secret: nconf.get('server:session:session-key') || 'key_' + new Date().getTime(),
		resave: true,
		saveUninitialized: true
	};
	return expressSession(opts);
};