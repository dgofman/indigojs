'use strict';

var indigo = require('../../indigo');

module.exports = function(router, next) {

	router.get('/:locale/login', function(req, res) {
		var locales = indigo.getLocales(req);
		req.model.pageTitle = locales.account.pageTitle; //set title in templates/head.html 
		req.model.routerName = 'account'; //pass argument to templates/head.html -> data-main
		indigo.render(req, res, 'login', locales);
		next();
	});

	router.get('/:locale/templates/:templateId', function(req, res) { //Template url: 'text!/account/templates/login' 
		indigo.render(req, res, 'templates/account/' + req.params.templateId);
		next();
	});

	return {
		'path': '/account',
		'controllers': [
			'examples/controllers'
		]
	};
};