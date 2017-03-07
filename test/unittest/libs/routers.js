'use strict';

var indigo = require('../../../indigo'),
	routers = require('../../../libs/routers'),
	assert = require('assert'),
	appconf = {
		get: function() { return null; }
	};

describe('libs/routers', function () {

	it('should test directory with non JS files', function (done) {
		routers.loadModule(['/examples/account/config']);
		done();
	});

	it('should test loading invalid mixin module (module.exports = {})', function (done) {
		indigo.logger.error = function() {};
		routers.loadModule(['/libs/locales.js']);
		done();
	});

	it('should test invalid module', function (done) {
		indigo.logger.error = function() {};
		routers.loadModule(['/README.md']);
		done();
	});

	it('should test invalid directory', function (done) {
		routers.loadModule(['/examples/account/foo']);
		done();
	});

	it('should test default setting in routerConf', function (done) {
		var opt = routers.routerConf();
		assert.equal(opt.base, '/route');
		done();
	});

	it('should validate default router path', function (done) {
		var loadModule = routers.loadModule;

		routers.loadModule = function(routers) {
			routers.loadModule = loadModule;
			assert.ok(routers instanceof Array);
			assert.equal(routers[0], '/routers');
			done();
		};
		routers.init(appconf);
	});
});
