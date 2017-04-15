'use strict';

const indigo = require('../../../indigo'),
	routers = require('../../../libs/routers'),
	assert = require('assert'),
	appconf = {
		get: function() { return null; }
	};

describe('libs/routers', () => {

	it('should test directory with non JS files', done => {
		routers.loadModule(['/examples/account/config']);
		done();
	});

	it('should test loading invalid mixin module (module.exports = {})', done => {
		indigo.logger.error = () => {};
		routers.loadModule(['/libs/locales.js']);
		done();
	});

	it('should test invalid module', done => {
		indigo.logger.error = () => {};
		routers.loadModule(['/README.md']);
		done();
	});

	it('should test invalid directory', done => {
		routers.loadModule(['/examples/account/foo']);
		done();
	});

	it('should test default setting in routerConf', done => {
		const opt = routers.routerConf();
		assert.equal(opt.base, '');
		done();
	});

	it('should validate default router path', done => {
		const loadModule = routers.loadModule;

		routers.loadModule = routers => {
			routers.loadModule = loadModule;
			assert.ok(routers instanceof Array);
			assert.equal(routers[0], '/routers');
			done();
		};
		routers.init(appconf);
	});
});