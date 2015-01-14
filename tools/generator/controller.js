'use strict';

var indigo = require('indigojs');

module.exports = function(router) {

	router.get('/index', function(req, res) {
		res.redirect(router.conf.base + '/en/index');
	});

	router.get('/:locale/index', function(req, res) {
		indigo.render(req, res, '/index');
	});
};