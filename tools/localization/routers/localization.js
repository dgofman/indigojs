'use strict';

var debug = require('debug')('indigo:localization');

module.exports = function() {
	return {
		'base': '/localization',
		'intercept': function(req, res, next) {
			if (req.headers.accept.indexOf('text/xml') === -1) {
				next();
			} else {
				/* 
				 *	prevent request handle on angular.bootstrap initialization
				 *  
				 */
				debug('intercept');
			}
		},
		'controllers': [
			'/tools/localization/controllers'
		]
	};
};