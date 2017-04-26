'use strict';

const indigo = global.__indigo;

module.exports = function(router) {

	router.get('/:locale/index', (req, res) => {
		indigo.render(req, res, '/demo_index');
	});

	router.get('/home', function(req, res) {
		req.model.page = 'Home Page (#home/)';
		if (req.model.app_template === 'fpa') {
			req.model.context = `
				<p><a href="services">Home Services</a></p>
				<p><a href="protection">Home Protection</a></p>
			`;
		}
		indigo.render(req, res, '/demo_content');
	});

	router.get('/home/services', function(req, res) {
		req.model.page = 'Home Services Page (#home/services)';
		if (req.model.app_template === 'spa') {
			req.model.context = '<a href="#home/">Back</a>';
		} else {
			req.model.context = '<a href="./">Back</a>';
		}
		indigo.render(req, res, '/demo_content');
	});

	router.get('/home/protection', function(req, res) {
		req.model.page = 'Home Protection Page (#home/protection)';
		req.model.context = '<a href="/" target="_parent">Home</a>';
		indigo.render(req, res, '/demo_content');
	});

	router.get('/product', function(req, res) {
		req.model.page = 'Product Page (#product/)';
		indigo.render(req, res, '/demo_content');
	});

	//Default route context handler (#contact, #about etc.)
	router.get('/:locale/fpa/:page', function(req, res) {
		req.model.page = req.params.page.toUpperCase();
		indigo.render(req, res, '/demo_content');
	});
};