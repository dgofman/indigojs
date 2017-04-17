'use strict';

const indigo = global.__indigo,
	defaultPage = 'home',
	bodyParser = require('body-parser'),
	expressSession = require('express-session');

module.exports = (router, app) => {

	app.use(bodyParser.urlencoded({ extended: false }));
	// parse application/json
	app.use(bodyParser.json());

	app.use(expressSession({
		secret: 'key_' + new Date().getTime(),
		resave: true,
		saveUninitialized: true
	}));

	app.get('/', (req, res) => {
		res.redirect(router.conf.base + '/index');
	});

	router.get('/', (req, res) => {
		res.redirect(router.conf.base + '/index');
	});

	router.get('/index', function(req, res) {
		indigo.getLocale(req);
		res.redirect(`${router.conf.base}/${req.session.locale}/index#${defaultPage}`);
	});

	router.get('/:locale/index', (req, res) => {
		indigo.render(req, res, '/index');
	});

	return {
		'base': '{{uri}}',
		'controllers': [
			'{{controllers}}'
		]
	};
};