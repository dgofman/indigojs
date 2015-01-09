'use strict';

module.exports = function(router, next) {

	router.get('/todo', function(req, res) {
		console.log(req, res);
		next();
	});
};