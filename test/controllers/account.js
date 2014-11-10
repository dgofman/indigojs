'use strict';

var indigo = require('../../indigo'),
	logger = indigo.logger;

var users = require('../models/account').users;

module.exports = function(router, next) {

	//REST calls
	router.post('/login', function(req, res) {
		logger.debug('post login::login', req.body.email);

		var user = users[req.body.email];
		if (user && user.password === req.body.password) {
	  		return res.json(user.details);
	  	}
	  	indigo.error(req, res, 'invalidEmailOrPassword');
	  	next();
	});

	router.post('/reset', function(req, res) {
		logger.debug('post login::reset', req.body.email);

		var user = users[req.body.email];
		if (user) {
	  		return res.json(user.details);
	  	}
	  	indigo.error(req, res, 'invalidAccount');
	  	next();
	});
};