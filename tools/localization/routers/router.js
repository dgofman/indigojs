'use strict';

var debug = require('debug')('indigo:localization');

module.exports = function(router, app) {

	//Redirect root / to /{{uri}}/en/index
	app.get('/', function(req, res) {
		res.redirect(router.conf.base + '/en/index');
	});

	//Redirect /{{uri}}/index to /{{uri}}/en/index
	router.get('/index', function(req, res) {
		res.redirect(router.conf.base + '/en/index');
	});

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