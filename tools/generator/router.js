'use strict';

const indigo = global.__indigo,
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
		res.redirect(router.conf.base + '/' + req.session.locale + '/index');
	});

	router.get('/:locale/index', (req, res) => {
		if (req.query.page !== undefined || !req.session.defaultPage) {
			req.session.defaultPage = req.query.page || 'home';
			res.redirect(`${router.conf.base}/index#${req.session.defaultPage}`);
		} else {
			req.model.page = req.session.defaultPage;
			indigo.render(req, res, '/index');
		}
	});

	return {
		'base': '{{uri}}',
		'controllers': [
			'{{controllers}}'
		]
	};
};