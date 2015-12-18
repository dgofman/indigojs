'use strict';

var reqmodel = require('../../../libs/reqmodel'),
	assert = require('assert'),
	appconf = {
		get: function() { return appconf.environment; }
	};

describe('libs/reqmodel', function () {

	it('should assign to default dev environment', function (done) {
		var req = {baseUrl: '/indigojs'};
		reqmodel(appconf)(req, null, function() {
			assert.equal(req.model.contextPath, '/indigojs');
			assert.equal(req.model.environment, 'dev');
			assert.equal(req.model.minify, '');
			assert.equal(req.model.extCSS, '.css');
			assert.equal(req.model.extJS, '.js');
			done();
		});
	});

	it('should verify environment is dev', function (done) {
		appconf.environment = 'dev';
		var req = {baseUrl: '/indigojs'};
		reqmodel(appconf)(req, '/newBaseURL', function() {
			assert.equal(req.model.contextPath, '/newBaseURL');
			assert.equal(req.model.environment, 'dev');
			assert.equal(req.model.minify, '');
			assert.equal(req.model.extCSS, '.css');
			assert.equal(req.model.extJS, '.js');
			done();
		});
	});

	it('should verify environment is prod', function (done) {
		appconf.environment = 'prod';
		var req = {baseUrl: '/indigojs'};
		reqmodel(appconf)(req, null, function() {
			assert.equal(req.model.environment, 'prod');
			assert.equal(req.model.minify, '.min');
			assert.equal(req.model.extCSS, '.min.css');
			assert.equal(req.model.extJS, '.min.js');
			done();
		});
	});

	it('should verify NODE_ENV is production', function (done) {
		var req = {baseUrl: '/indigojs'},
			env = process.env.NODE_ENV;
		appconf.environment = 'dev';
		process.env.NODE_ENV = 'production';
		reqmodel(appconf)(req, null, function() {
			assert.equal(req.model.environment, 'prod');
			assert.equal(req.model.minify, '.min');
			assert.equal(req.model.extCSS, '.min.css');
			assert.equal(req.model.extJS, '.min.js');
			process.env.NODE_ENV = env;
			done();
		});
	});
});
