'use strict';

const indigo = global.__indigo;

module.exports = function(router) {

	router.get('/:locale/spa/:page', function(req, res) {
		res.send(`<h1>${req.params.page.toUpperCase()}</h1>`);
	});

	router.get('/:locale/fpa/:page', function(req, res) {
		req.model.page = req.params.page.toUpperCase();
		indigo.render(req, res, '/fpa-content');
	});
};