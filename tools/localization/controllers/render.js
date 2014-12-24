var indigo = require('../../../indigo'),
	debug = require('debug')('indigo:localization');

module.exports = function(router, next) {

	router.get('/index', function(req, res) {
		res.redirect(router.base + '/en/index');
		next();
	});

	router.get('/:locale/index', function(req, res) {
		var locales = indigo.getLocales(req);
		req.model.pageTitle = locales.content.pageTitle;
		req.model.routerName = 'localization';
		req.model.languages = '';
		indigo.render(req, res, 'index', locales);
		next();
	});
};