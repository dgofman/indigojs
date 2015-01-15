'use strict';

var indigo = require('../../../indigo');

module.exports = function(router) {

	router.get('/index', function(req, res) {
		var locales = {
			pageTitle: 'FirstStep',
			head: 'First Step',
			copyright: 'Copyright @ 2014'
		};
		indigo.render(req, res, '/index', locales);
	});

	router.get('/REST', function(req, res) {
		res.json({ 'method': 'GET' });
	});

	router.post('/REST', function(req, res) {
		res.json({ 'method': 'POST' });
	});

	router.put('/REST', function(req, res) {
		res.json({ 'method': 'PUT' });
	});

	router.delete('/REST', function(req, res) {
		res.json({ 'method': 'DELETE' });
	});

	router.patch('/REST', function(req, res) {
		res.json({ 'method': 'PATCH' });
	});

	router.get('/TEST', function(req, res) {
		res.send('HELLO WORLD!');
	});

	return '/firststep';
};