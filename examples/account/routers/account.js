'use strict';

var indigo = require('../../../indigo'),
	bodyParser = require('body-parser'),
	expressSession = require('express-session');

module.exports = function(router, app) {

	app.use(bodyParser.urlencoded({ extended: false }));
	// parse application/json
	app.use(bodyParser.json());

	app.use(expressSession({
		secret: 'key_' + new Date().getTime(),
		resave: true,
		saveUninitialized: true
	}));
	
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