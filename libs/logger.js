'use strict';

var pine = require('pine');

/**
  * Description
  * @param {} appconf
  * @return log
  */
module.exports = function logger(appconf) {
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