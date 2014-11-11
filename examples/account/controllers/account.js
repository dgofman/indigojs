'use strict';

var indigo = require('../../../indigo'),
	debug = require('debug')('indigo:account');

var users = require('../models/account').users;

module.exports = function(router, next) {

	//REST calls
	router.post('/login', function(req, res) {
		debug('post login::login %s', req.body.email);

		var user = users[req.body.email];
		if (user && user.password === req.body.password) {
	  		return res.json(user.details);
	  	}
	  	indigo.error(req, res, 'invalidEmailOrPassword');
	  	next();
	});

	router.post('/reset', function(req, res) {
		debug('post login::reset %s', req.body.email);

		var user = users[req.body.email];
		if (user) {
	  		return res.json(user.details);
	  	}
	  	indigo.error(req, res, 'invalidAccount');
	  	next();
	});
};