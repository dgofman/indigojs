'use strict';

const indigo = global.__indigo;

module.exports = function(router) {

	/***************** SPA Routes *****************/
	router.get('/:locale/spa/:page', function(req, res) {
		res.send(`<h1>${req.params.page.toUpperCase()}</h1>`);
	});

	/***************** FPA Routes *****************/

	//Home Menu #home/
	router.get('/home', function(req, res) {
		req.model.page = 'Home Page (#home/)';
		req.model.context = `
			<p><a href="services">Home Services</a></p>
			<p><a href="protection">Home Protection</a></p>
		`;
		indigo.render(req, res, '/fpa-content');
	});

	router.get('/home/services', function(req, res) {
		req.model.page = 'Home Services Page (#home/services)';
		req.model.context = '<a href="./">Back</a>';
		indigo.render(req, res, '/fpa-content');
	});

	router.get('/home/protection', function(req, res) {
		req.model.page = 'Home Protection Page (#home/protection)';
		req.model.context = '<a href="/" target="_parent">Back</a>';
		indigo.render(req, res, '/fpa-content');
	});

	//Product Menu #product/
	router.get('/product', function(req, res) {
		req.model.page = 'Product Page (#product/)';
		indigo.render(req, res, '/fpa-content');
	});

	//Default route context handler (#contact, #about etc.)
	router.get('/:locale/fpa/:page', function(req, res) {
		req.model.page = req.params.page.toUpperCase();
		indigo.render(req, res, '/fpa-content');
	});
};