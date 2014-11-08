'use strict';

var expressSession = require('express-session');

module.exports = function session(nconf) {
	return expressSession({
		secret: nconf.get('server:session:session-key') || new Date().getTime(),
		resave: true,
		saveUninitialized: true
	});
};