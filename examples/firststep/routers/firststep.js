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

	router.get('/index', function(req, res) {
		var locales = {
			pageTitle: 'FirstStep',
			head: 'First Step',
			copyright: 'Copyright @ 2014'
		};
		indigo.render(req, res, '/index', locales);
	});

	router.get('/REST', function(req, res) {
		res.json({ 'method': 'GET' });
	});

	router.post('/REST', function(req, res) {
		res.json({ 'method': 'POST' });
	});

	router.put('/REST', function(req, res) {
		res.json({ 'method': 'PUT' });
	});

	router.delete('/REST', function(req, res) {
		res.json({ 'method': 'DELETE' });
	});

	router.patch('/REST', function(req, res) {
		res.json({ 'method': 'PATCH' });
	});

	router.get('/invalidTemplate', function(req, res) {
		indigo.render(req, res, '/invalidTemplate');
	});

	router.get('/invalidContext', function(req, res) {
		indigo.render(req, res, '/invalid_page');
	});

	return '/firststep';
};