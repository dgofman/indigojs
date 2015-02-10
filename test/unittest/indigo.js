'use strict';

var indigo = require('../../indigo'),
	assert = require('assert');

var acceptLanguage = 'en-gb, en-us';

describe('UnitTests Indigo APIs', function () {

	it('should test JSON custom configuration', function (done) {
		var appconfig = indigo.init({parent: {child1: 1, child2: 2}});
		assert.equal(appconfig.get('parent:child1'), 1);
		assert.equal(appconfig.get('parent:child2'), 2);
		done();
	});

	it('should init app', function (done) {
		indigo.init(__appDir + '/examples/account/config/app.json');
		assert.equal(indigo.appconf.server.webdir, '/examples/account/web');
		done();
	});

	it('should verify __appDir', function (done) {
		assert.equal(fixPath(__appDir) + '/test/unittest', fixPath(__dirname));
		done();
	});

	it('should get EN location', function (done) {
		var req = {
				session: {},
				headers: {
					'accept-language': acceptLanguage
				}
			},res = {
				render: function(url, model) {
					console.log(fixPath(url), fixPath(__appDir) + '/examples/account/web/en/login.html');
					assert.equal(fixPath(url), fixPath(__appDir) + '/examples/account/web/en/login.html');
					assert.equal(model.locality.locale, 'en-gb');
					assert.equal(model.locality.langugage, 'en');
					assert.equal(model.locales.account.greeting, 'Hello');
					done();
				}
			};

		indigo.render(req, res, '/login.html');
	});

	it('should test US locale', function (done) {
		var req = {
				params: {
					locale: 'en-us'
				},
				session: {},
				headers: {
					'accept-language': acceptLanguage
				}
			},res = {
				render: function(url, model) {
					assert.equal(model.locality.locale, 'en-us');
					assert.equal(model.locality.langugage, 'en-us');
					assert.equal(model.locales.account.greeting, 'Hi');
					done();
				}
			};

		indigo.render(req, res, '/login');
	});

	it('should test RU locale', function (done) {
		var locales = null,
			req = {
				params: {
					countryCode: 'ru'
				},
				session: {},
				model: require(__appDir + '/libs/reqmodel')(indigo.appconf),
				headers: {
					'accept-language': acceptLanguage
				}
			},res = {
				render: function(url, model) {
					assert.equal(model.locality.locale, 'ru');
					assert.equal(model.locality.langugage, 'ru');
					assert.equal(locales.account.greeting, 'Здравствуйте');
					done();
				}
			};

		locales = indigo.getLocale(req, 'countryCode'); //req.params.countryCode

		indigo.render(req, res, '/login', locales);
	});

	it('should get 404 status code', function (done) {
		var req = {
				session: {},
			},res = {
				status: function(code) {
					assert.equal(code, 404);
				},
				render: function() {
					done();
				}
			};
		indigo.render(req, res, '/login404');
	});

	it('should get 404 file path', function (done) {
		var req = {
				session: {},
			},res = {
				status: function(code) {
					assert.equal(code, 404);
				},
				setHeader: function(key, value) {
					if (key === 'path') {
						assert.equal(fixPath(__appDir) + '/examples/account/web/login404.html', fixPath(value));
					}
				},
				render: function() {
					done();
				}
			};
		indigo.render(req, res, '/login404');
	});

	it('should test getNewURL', function (done) {
		var req = {
				session: {
					locale: 'en'
				}
			};
		assert.equal(indigo.getNewURL(req, null, '/foo'), '/foo');
		done();
	});

	it('should test libs module(s)', function (done) {
		var errorHandler = require('../../libs/errorHandler');
		assert.equal(errorHandler, indigo.libs('errorHandler'));
		done();
	});
});

function fixPath(path) {
	return path.replace(/\\/g, '/').replace(/\/\//g, '/');
}
