'use strict';

const winston = require('winston');

/**
 * This module including default a logger class is used to log messages for a specific system.
 * The logger is determined by the configured levels from <code>app.json</code> file.
 * From application configuration file can may provide path to another logger source module.
 * 
 * @see {@link libs/locales.js libs/logger}
 * @see {@link https://www.npmjs.com/package/winston}
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
 * @return {winston} winston Reference to <code>winston</code> library.
 *
 */

function logger(appconf) {
	const log = new (winston.Logger)({
		levels: winston.config.npm.levels,
		colors: winston.config.npm.colors,

		transports: [
			new (winston.transports.Console)({
				level : appconf.get('logger:level') || 'debug',
				colorize: true
			})
		]
	});


	log.setLevel = level => {
		log.transports.console.level = level;
	};

	log.getLevel = () => {
		return log.transports.console.level;
	};

	return log;
}

/**
 * @module logger
 * @see {@link libs/logger}
 */
module.exports = logger;