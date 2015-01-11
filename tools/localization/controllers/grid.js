'use strict';

module.exports = function(router) {

	router.get('/todo', function(req, res) {
		console.log(req, res);
	});
};