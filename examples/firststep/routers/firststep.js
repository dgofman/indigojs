'use strict';

var indigo = require('../../../indigo');

module.exports = function(router, next) {

	router.get('/index', function(req, res) {
		var locales = {
			pageTitle: 'FirstStep',
			head: 'First Step',
			copyright: 'Copyright @ 2014'
		};
		indigo.render(req, res, 'index', locales);
		next();
	});

	return '/firststep';
};