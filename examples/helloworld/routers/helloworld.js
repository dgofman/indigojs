'use strict';

var indigo = require('../../../indigo');

module.exports = function(router, app) {

	app.get('/', function(req, res) {
		res.redirect(router.conf.base);
	});

	router.get('/', function(req, res) {
		indigo.getLocale(req);
		res.redirect(router.conf.base + '/' + req.session.locale + '/index');
	});

	router.get('/:locale/index', function(req, res) {
		indigo.render(req, res, '/index');
	});

	return {
		'base': '/helloworld',
		'intercept': function(req, res, next) {
			next();
		}
	};
};