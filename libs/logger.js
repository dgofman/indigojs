'use strict';

var indigo = require('../indigo'),
	pine = require('pine');

module.exports = pine(':', {
	transports: {
		console: {
			level: indigo.appConfig.get('logger:level')
		}
	}
});