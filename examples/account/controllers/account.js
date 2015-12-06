'use strict';

var debug = require('debug')('indigo:account'),
	indigo = require('../../../indigo'),
	users = require('../models/account').users;

module.exports = function(router) {

	//REST calls
	router.post('/login', function(req, res) {
		debug('post login::login %s', req.body.email);

		var user = users[req.body.email];
		if (user && user.password === req.body.password) {
			return res.json(user.details);
		}
		indigo.errorHandler.json(req, res, 'invalidEmailOrPassword');
	});

	router.post('/reset', function(req, res) {
		debug('post login::reset %s', req.body.email);

		var user = users[req.body.email];
		if (user) {
			return res.json(user.details);
		}
		indigo.errorHandler.json(req, res, 'invalidAccount');
	});
};