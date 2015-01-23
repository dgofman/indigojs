'use strict';

module.exports = function(router, app) {

	var conf = {
		'base': '{{uri}}',
		'controllers': [
			'/controllers'
		]
	};

	//Redirect root / to /{{uri}}/en/index
	app.get('/', function(req, res) {
		res.redirect(router.conf.base + '/en/index');
	});

	//Redirect /{{uri}}/index to /{{uri}}/en/index
	router.get('/index', function(req, res) {
		res.redirect(router.conf.base + '/en/index');
	});

	return conf;
};