'use strict';

var pine = require('pine');

/**
 * This module including default a logger class is used to log messages for a specific system.
 * The logger is determined by the configured levels from <code>app.json</code> file.
 * From application configuration file can may provide path to another logger source module.
 * 
 * @see {@link libs/locales.js libs/logger}
 * @see {@link https://www.npmjs.com/package/pine}
 *
 * @example
 * conf/app.json 
 *{
 *	...
 *	"logger": {
 *		"level": "debug",
 *		"path": null
 * 	}
 *	...
 *}
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/logger
 * @param {Object} appconf An application configuration.
 * @return {pine} pine Reference to <code>pine</code> library.
 *
 * @requires pine
 */
function logger(appconf) {
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
}

/**
 * @module logger
 * @see {@link libs/logger}
 */
module.exports = logger;