'use strict';

var indigo = require('indigojs');

module.exports = function(router, app) {

	app.get('/', function(req, res) {
		res.redirect(router.conf.base + '/index');
	});

	router.get('/', function(req, res) {
		res.redirect(router.conf.base + '/index');
	});

	router.get('/index', function(req, res) {
		indigo.getLocale(req);
		res.redirect(router.conf.base + '/' + req.session.locale + '/index');
	});

	return {
		'base': '{{uri}}',
		'controllers': [
			'{{controllers}}'
		]
	};
};