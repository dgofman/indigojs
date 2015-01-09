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

	router.get('/REST', function(req, res) {
		res.json({ 'method': 'GET' });
		next();
	});

	router.post('/REST', function(req, res) {
		res.json({ 'method': 'POST' });
		next();
	});

	router.put('/REST', function(req, res) {
		res.json({ 'method': 'PUT' });
		next();
	});

	router.delete('/REST', function(req, res) {
		res.json({ 'method': 'DELETE' });
		next();
	});

	router.patch('/REST', function(req, res) {
		res.json({ 'method': 'PATCH' });
		next();
	});

	return '/firststep';
};