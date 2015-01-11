'use strict';

var expressSession = require('express-session');

module.exports = function session(appconf) {
	var opts = {
		secret: appconf.get('server:session:session-key') || 'key_' + new Date().getTime(),
		resave: true,
		saveUninitialized: true
	};
	return expressSession(opts);
};