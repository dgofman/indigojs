'use strict';

var indigo = require('../../../indigo');

module.exports = function(router) {

	router.get('/login', function(req, res) {
		res.redirect(router.conf.base + '/en/login');
	});

	router.get('/:locale/login', function(req, res) {
		var locales = indigo.getLocale(req);
		req.model.pageTitle = locales.account.pageTitle; //set title in templates/head.html 
		indigo.render(req, res, '/login', locales);
	});

	router.get('/:locale/templates/:templateId', function(req, res) { //Template url: 'text!/account/templates/login' 
		indigo.render(req, res, '/templates/account/' + req.params.templateId);
	});

	return {
		'base': '/account',
		'middleware': function(req, res, next) {
			next();
		},
		'controllers': [
			'/examples/account/controllers'
		]
	};
};