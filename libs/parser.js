'use strict';

var bodyParser = require('body-parser');

/**
 * Default module for the initialization of <code>req.body</code> request attribute.
 * For initialization of custom parsing module locate the path to the new library.
 *
 * @example
 * conf/app.json 
 *{
 *
 *	"server": {
 *		...
 *		"parser": {
 *			"path": null
 *		}
 *		...
 *	}
 *}
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/parser
 *
 * @param {express} app Instance of the application server.
 * @param {Object} appconf An application configuration.
 *
 * @see {@link libs/parser.js}
 * @see {@link https://www.npmjs.com/package/body-parser}
 *
 * @requires body-parser
 */
function parser(app, appconf) {
	// parse application/x-www-form-urlencoded
	app.use(bodyParser.urlencoded({ extended: appconf.get('server:parser:extended') || false }));

	// parse application/json
	app.use(bodyParser.json());
}

/**
 * @module parser
 * @see {@link libs/parser}
 */
module.exports = parser;