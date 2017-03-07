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
		'base': '/helloworld'
	};
};