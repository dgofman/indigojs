'use strict';

var bodyParser = require('body-parser');

/**
 * Description
 * @method exports
 * @return CallExpression
 */
module.exports = function parser() {
	return bodyParser.json(); //enabled req.body
};