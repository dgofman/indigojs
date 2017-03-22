'use strict';

var indigo = require('indigojs'),
	data = require(`${__appDir}/model/data.json`);

module.exports = function(router) {

	router.get('/:locale/index', function(req, res) {
		indigo.render(req, res, '/index');
	});

	router.get('/content/:page', function(req, res) {
		req.model.data = data;
		req.model.pageTitle = req.params.page.toUpperCase();
		indigo.render(req, res, '/content');
	});
};