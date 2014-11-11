'use strict';

var indigo = require('../../../indigo');

module.exports = function(router, next) {

	router.get('/:locale/index', function(req, res) {
		indigo.render(req, res, 'index');
		next();
	});

	return '/helloworld';
};