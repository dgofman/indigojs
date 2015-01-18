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
 * @return {express.bodyParser} JSON request parameters.
 * 
 * @see {@link libs/parser.js}
 * @see {@link https://www.npmjs.com/package/body-parser}
 *
 * @requires body-parser
 */
function parser() {
	return bodyParser.json();
}

/**
 * @module parser
 * @see {@link libs/parser}
 */
module.exports = parser;