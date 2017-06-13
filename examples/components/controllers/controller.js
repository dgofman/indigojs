'use strict';

const indigo = global.__indigo;

module.exports = function(router) {

	router.get('/:locale/index', (req, res) => {
		indigo.render(req, res, '/index');
	});

	router.get('/igo', function(req, res) {
		indigo.render(req, res, '/indigo_components.html');
	});

	router.get('/jui', function(req, res) {
		indigo.render(req, res, '/jqueryui_components.html');
	});

	router.get('/core', function(req, res) {
		indigo.render(req, res, '/data_binding.html');
	});
};