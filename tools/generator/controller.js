'use strict';

var indigo = global.__indigo;

module.exports = function(router) {

	router.get('/:locale/index', function(req, res) {
		indigo.render(req, res, '/index');
	});

	router.get('/content/:page', function(req, res) {
		req.model.pageTitle = req.params.page.toUpperCase();
		indigo.render(req, res, '/content');
	});
};