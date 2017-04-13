'use strict';

var indigo = global.__indigo;

module.exports = function(router) {

	router.get('/:locale/content/:page', function(req, res) {
		res.send(`<h1>${req.params.page.toUpperCase()}</h1>`);
	});
};