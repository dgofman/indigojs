'use strict';

var indigo = require('indigojs');

module.exports = function(router) {

	router.get('/:locale/index', function(req, res) {
		indigo.render(req, res, '/index');
	});
};