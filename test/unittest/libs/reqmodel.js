'use strict';

const reqmodel = require('../../../libs/reqmodel'),
	assert = require('assert'),
	appconf = {
		get: function() { return appconf.environment; }
	};

describe('libs/reqmodel', () => {

	it('should assign to default dev environment', done => {
		const req = {baseUrl: '/indigojs'};
		reqmodel(appconf)(null, req, null, () => {
			assert.equal(req.model.contextPath, '/indigojs');
			assert.equal(req.model.environment, 'dev');
			assert.equal(req.model.minify, '');
			assert.equal(req.model.extCSS, '.css');
			assert.equal(req.model.extJS, '.js');
			done();
		});
	});

	it('should verify environment is dev', done => {
		appconf.environment = 'dev';
		const req = {baseUrl: '/indigojs'};
		reqmodel(appconf)('/newBaseURL', req, null, () => {
			assert.equal(req.model.contextPath, '/newBaseURL');
			assert.equal(req.model.environment, 'dev');
			assert.equal(req.model.minify, '');
			assert.equal(req.model.extCSS, '.css');
			assert.equal(req.model.extJS, '.js');
			done();
		});
	});

	it('should verify environment is prod', done => {
		appconf.environment = 'prod';
		const req = {baseUrl: '/indigojs'};
		reqmodel(appconf)(null, req, null, () => {
			assert.equal(req.model.environment, 'prod');
			assert.equal(req.model.minify, '.min');
			assert.equal(req.model.extCSS, '.min.css');
			assert.equal(req.model.extJS, '.min.js');
			done();
		});
	});

	it('should verify NODE_ENV is production', done => {
		const req = {baseUrl: '/indigojs'},
			env = process.env.NODE_ENV;
		appconf.environment = 'dev';
		process.env.NODE_ENV = 'production';
		reqmodel(appconf)(null, req, null, () => {
			assert.equal(req.model.environment, 'prod');
			assert.equal(req.model.minify, '.min');
			assert.equal(req.model.extCSS, '.min.css');
			assert.equal(req.model.extJS, '.min.js');
			process.env.NODE_ENV = env;
			done();
		});
	});
});