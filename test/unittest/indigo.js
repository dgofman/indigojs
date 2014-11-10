'use strict';

var debug = require('debug')('indigo:test'),
	indigo = require('../../indigo'),
	assert = require('assert'),
	reqmodel = require(__appDir + '/libs/reqmodel'),
	nconf = require('nconf').
				use('file', { file: __appDir + '/test/config/app.json' });

describe('Testing indigo.js', function () {

	var acceptLanguage = 'en-gb, en-us';

	it('should verify __appDir', function (done) {
		assert.equal(__appDir + 'test/unittest', __dirname);
		done();
	});

	it('should be UK language from req.headers', function (done) {

		var req = {
				session: {},
				model: reqmodel(nconf),
				headers: {
					'accept-language': acceptLanguage
				}
			},res = {
				render: function(url, model) {
					assert.equal(url, __appDir + 'test/web/en-gb/login');
					assert.equal(model.environment, 'dev');
					assert.equal(model.locality.locale, 'en-gb');
					assert.equal(model.locality.langugage, 'en');
					assert.equal(model.locales.account.greeting, 'Hello');
					done();
				}
			};

		indigo.init(nconf);

		indigo.render(req, res, 'login');
	});

	it('should test US locale', function (done) {

		var req = {
				params: {
					locale: 'us'
				},
				session: {},
				model: reqmodel(nconf),
				headers: {
					'accept-language': acceptLanguage
				}
			},res = {
				render: function(url, model) {
					assert.equal(model.locality.locale, 'us');
					assert.equal(model.locality.langugage, 'en');
					assert.equal(model.locales.account.greeting, 'Hi');
					done();
				}
			};

		indigo.init(nconf);

		indigo.render(req, res, 'login');
	});

	it('should test RU locale', function (done) {

		var locales = null,
			req = {
				params: {
					countryCode: 'ru'
				},
				session: {},
				model: reqmodel(nconf),
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

		indigo.init(nconf);

		locales = indigo.getLocales(req, 'countryCode'); //req.params.countryCode

		indigo.render(req, res, 'login', locales);
	});

	it('should test default error 400', function (done) {

		var errorKey = 'invalidAccount',
			locale = 'en-us',
			errors = indigo.locales.localeMap[locale].errors,
			req = {
				session: {
					locale: locale
				},
				model: reqmodel(nconf),
				headers: {
					'accept-language': acceptLanguage
				}
			},res = {
				json: function(errorCode, model) {
					assert.equal(errorCode, 400);
					debug('error: %s', errors[errorKey]);
					assert.equal(model.error, errors[errorKey]);
					done();
				}
			};

		indigo.init(nconf);

		indigo.error(req, res, errorKey);
	});

	it('should test custom error 500', function (done) {

		var errorCode = 500,
			errorKey = 'invalidAccount',
			locale = 'ru',
			errors = indigo.locales.localeMap[locale].errors,
			req = {
				session: {
					locale: locale
				},
				model: reqmodel(nconf),
				headers: {
					'accept-language': acceptLanguage
				}
			},res = {
				json: function(errorCode, model) {
					assert.equal(errorCode, errorCode);
					debug('error: %s', errors[errorKey]);
					assert.equal(model.error, errors[errorKey]);
					done();
				}
			};

		indigo.init(nconf);

		indigo.error(req, res, errorKey, errorCode);
	});
});
