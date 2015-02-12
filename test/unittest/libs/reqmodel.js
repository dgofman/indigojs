'use strict';

var reqmodel = require('../../../libs/reqmodel'),
	assert = require('assert'),
	appconf = {
		get: function() { return appconf.environment; }
	};

describe('libs/reqmodel', function () {

	it('should verify environment is dev', function (done) {
		appconf.environment = 'dev';
		var conf = reqmodel(appconf);
		assert.equal(conf.environment, 'dev');
		assert.equal(conf.minify, '');
		assert.equal(conf.extCSS, '.css');
		assert.equal(conf.extJS, '.js');
		done();
	});

	it('should verify environment is prod', function (done) {
		appconf.environment = 'prod';
		var conf = reqmodel(appconf);
		assert.equal(conf.environment, 'prod');
		assert.equal(conf.minify, '.min');
		assert.equal(conf.extCSS, '.min.css');
		assert.equal(conf.extJS, '.min.js');
		done();
	});

	it('should verify NODE_ENV is production', function (done) {
		var conf,
			env = process.env.NODE_ENV;
		appconf.environment = 'dev';
		process.env.NODE_ENV = 'production';
		conf = reqmodel(appconf);
		assert.equal(conf.environment, 'prod');
		assert.equal(conf.minify, '.min');
		assert.equal(conf.extCSS, '.min.css');
		assert.equal(conf.extJS, '.min.js');
		process.env.NODE_ENV = env;
		done();
	});
});
