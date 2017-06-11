'use strict';

const winston = require('winston');

/**
 * This module includes a default logger class and is used to log messages for a specific system.
 * The logger is determined by the configured levels from the <code>app.json</code> file.
 * The application configuration file can provide the path to another logger source module as well.
 * 
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

const logger = (appconf) => {
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

	/**
	 * Dynamically changes the <code>winston</code> log level of a transport at runtime.
	 *
	 * @memberof libs/logger
	 * @alias getLevel
	 *
	 * @param {String} level New logging level - [error, warn, info, verbose, debug, silly]
	 */
	log.setLevel = level => {
		log.transports.console.level = level;
	};

	/**
	 * Gets the current <code>winston</code> log level.
	 *
	 * @memberof libs/logger
	 * @alias getLevel
	 *
	 * @return {String} locale Returns the logging levels
	 */
	log.getLevel = () => {
		return log.transports.console.level;
	};

	return log;
};

/**
 * @module logger
 * @see {@link libs/logger}
 */
module.exports = logger;