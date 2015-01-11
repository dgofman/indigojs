'use strict';

var pine = require('pine'),
	logger = null;

module.exports = logger = function logger(appconf) {
	var log = pine(':', {
		transports: {
			console: {
				level: appconf.get('logger:level')
			}
		}
	});

	for (var name in log._impl) {
		if (typeof log._impl[name] === 'function') {
			logger[name] = log._impl[name];
		}
	}

	return log;
};