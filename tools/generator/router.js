'use strict';

const defaultPage = 'home',
	bodyParser = require('body-parser');

module.exports = (router, app) => {

	app.use(bodyParser.urlencoded({ extended: false }));
	// parse application/json
	app.use(bodyParser.json());

	app.get('/', (req, res) => {
		res.redirect(router.conf.base + '/index');
	});

	router.get('/', (req, res) => {
		res.redirect(router.conf.base + '/index');
	});

	router.get('/index', (req, res) => {
		res.redirect(`${router.conf.base}/${req.model.locality.locale}/index#${defaultPage}/`);
	});

	return {
		'base': '{{uri}}',
		'controllers': [
			'{{controllers}}'
		]
	};
};