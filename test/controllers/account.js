'use strict';

var indigo = require('../../indigo'),
	logger = indigo.logger;

var users = require('../models/account').users;

module.exports = function(app, uri, next) {

	//HTML/templates renderer
	app.get(uri + '/login', function(req, res) {
		req.model.jsDir = 'account';
		indigo.render(req, res, 'account', 'login_html');
		next();
	});

	//REST calls
	app.post('/login', function(req, res) {
		logger.debug('post login::login', req.body.email);

		var user = users[req.body.email];
		if (user && user.password === req.body.password) {
	  		return res.json(user.details);
	  	}
	  	indigo.error(req, res, 'invalidEmailOrPassword');
	  	next();
	});

	app.post('/reset', function(req, res) {
		logger.debug('post login::reset', req.body.email);

		var user = users[req.body.email];
		if (user) {
	  		return res.json(user.details);
	  	}
	  	indigo.error(req, res, 'invalidAccount');
	  	next();
	});
};