'use strict';

var locales = require('../../../libs/locales')(),
	fs = require('fs'),
	indigo = require('../../../indigo'),
	assert = require('assert');

describe('libs/locales', function () {

	var appconf = indigo.init(__appDir + '/examples/account/config/app.json');

	it('should skip not json files', function (done) {
		var fileName = __appDir + '/examples/account/locales/en/invalid.js';
		fs.writeFileSync(fileName, 'HELLO WORLD');
		locales.config(appconf);
		fs.unlinkSync(fileName);
		done();
	});

	it('should test try/catch', function (done) {
		indigo.logger.error = function() {};
		var fileName = __appDir + '/examples/account/locales/en/invalid.json';
		fs.writeFileSync(fileName, 'HELLO WORLD');
		locales.config(appconf);
		fs.unlinkSync(fileName);
		assert.ok(locales.errorFiles[fileName].name.indexOf('Error') !== -1);
		done();
	});

	it('should test invalid Accept-Language code', function (done) {
		var req = {
				session: {},
				headers: {
					'accept-language': 'ZZ'
				}
			};
		locales.init(req);
		assert.equal(req.session.locale, 'en-us');
		done();
	});

	it('should test locales monitor', function (done) {
		appconf.locales.monitor = 0.1;
		locales.config(appconf);
		for (var file in locales.lastModified) {
			locales.lastModified[file] = new Date();
			break;
		}
		locales.monitor(appconf);
		setTimeout(done, 500);
	});
});
