'use strict';

var indigo = global.__indigo,
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
		'base': '/components',
		'controllers': [
			'/examples/components/controllers'
		]
	};
};