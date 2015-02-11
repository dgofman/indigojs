'use strict';

var routers = require('../../../libs/routers'),
	assert = require('assert'),
	appconf = {
		get: function() { return null; }
	};

describe('libs/routers', function () {

	it('should test directory with non JS files', function (done) {
		routers.loadModule(appconf, ['/examples/account/config']);
		done();
	});

	it('should test invalid directory', function (done) {
		routers.loadModule(appconf, ['/examples/account/foo']);
		done();
	});

	it('should test default setting in routerConf', function (done) {
		var opt = routers.routerConf();
		assert.equal(opt.base, '/route');
		done();
	});

	it('should validate default router path', function (done) {
		var loadModule = routers.loadModule;

		routers.loadModule = function(appconf, routers) {
			routers.loadModule = loadModule;
			assert.ok(routers instanceof Array);
			assert.equal(routers[0], '/routers');
			done();
		};
		routers.init(null, appconf);
	});
});
