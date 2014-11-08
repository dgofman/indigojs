'use strict';

var bodyParser = require('body-parser');

module.exports = function parser() {
	return bodyParser.json(); //enabled req.body
};