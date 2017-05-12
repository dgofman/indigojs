'use strict';

const indigo = global.__indigo;

module.exports = function(router) {

	router.get('/:locale/index', (req, res) => {
		indigo.render(req, res, '/index');
	});

	router.get('/components', function(req, res) {
		indigo.render(req, res, '/components');
	});
};