'use strict';

var debug = require('debug')('indigo:test'),
	errorHandler = require('../../../libs/errorHandler'),
	indigo = require('../../../indigo'),
	locales = require('../../../libs/locales'),
	assert = require('assert');

describe('libs/errorHandler', function () {

	var appconf = indigo.init(__appDir + '/examples/account/config/app.json');


	it('should validate err is null', function (done) {
		errorHandler(null)(null, null, null, function() {
			done();
		});
	});

	it('should validate err is null', function (done) {
		indigo.error(null, null, {
			status: function(code) {
				assert.equal(code, 400);
				return {
					json: function(error) {
						assert.equal(error, null);
						done();
					}
				};
			}
		});
	});

	it('should validate err 404', function (done) {
		errorHandler(appconf)(true, {
				url: '/foo.html'
			}, 
			{
			statusCode: 404,
			status: function(code) {
				assert.equal(code, 202);
				return {
					render: function(url, model) {
						assert.equal(model.code, 404);
						assert.equal(model.message, 'Not Found');
						assert.equal(model.details, 'The requested URL was not found on this server: <code>/foo.html</code>');
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 500', function (done) {
		errorHandler(appconf)(true, {
				url: '/foo.html'
			}, {
			statusCode: 500,
			status: function(code) {
				assert.equal(code, 202);
				return {
					render: function(url, model) {
						assert.equal(model.code, 500);
						assert.equal(model.message, 'Internal Server Error');
						assert.equal(model.details, 'The server encountered an unexpected condition.');
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 503', function (done) {
		errorHandler(appconf)(true, {
				url: '/foo.html'
			}, {
			statusCode: 503,
			status: function(code) {
				assert.equal(code, 202);
				return {
					render: function(url, model) {
						assert.equal(model.code, 503);
						assert.equal(model.message, 'Service Unavailable');
						assert.equal(model.details, 'Connection refuse.');
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 911', function (done) {
		appconf.errors.template = null;
		errorHandler(appconf)(true, {
				url: '/foo.html'
			}, {
			statusCode: 911,
			status: function(code) {
				assert.equal(code, 202);
				return {
					render: function(url, model) {
						assert.equal(model.code, 911);
						assert.equal(model.message, 'System Error');
						assert.equal(model.details, 'Please contact your system administrator.');
						done();
					}
				};
			}
		}, null);
	});

	it('should test redirect', function (done) {
		appconf.errors['404'] = 'http://www.google.com/indigojs';
		errorHandler(appconf)(true, {
				url: '/foo.html'
			}, {
				statusCode: 404,
				redirect: function(url) {
					assert.equal(url, appconf.errors['404']);
					done();
				}
		}, null);
	});

	it('should test injectErrorHandler', function (done) {
		var error = {error:'ERROR'};
		assert.equal(errorHandler.injectErrorHandler(error).error, error.toString());
		done();
	});

	it('should test default error 400', function (done) {
		var errorCode = 400,
			errorKey = 'invalidAccount',
			locale = 'en-us',
			errors = locales.localeMap[locale].errors,
			req = {
				session: {
					locale: locale
				}
			},res = {
				status: function(statusCode) {
					assert.equal(statusCode, errorCode);
					return res;
				},
				json: function(model) {
					debug('error: %s', errors[errorKey]);
					assert.equal(model.error, errors[errorKey]);
					done();
				}
			};

		errorHandler.json(req, res, errorKey);
	});

	it('should test if error.json is missing', function (done) {
		var errorCode = 400,
			errorKey = 'invalidAccount',
			locale = 'en-us',
			errors = locales.localeMap[locale].errors,
			req = {
				session: {
					locale: locale
				}
			},res = {
				status: function(statusCode) {
					assert.equal(statusCode, errorCode);
					return res;
				},
				json: function(model) {
					locales.localeMap[locale].errors = errors;
					assert.equal(model.error, errorKey);
					done();
				}
			};
		locales.localeMap[locale].errors = null;
		errorHandler.json(req, res, errorKey);
	});

	it('should test custom error 500', function (done) {
		var errorCode = 500,
			errorKey = 'invalidAccount',
			locale = 'ru',
			errors = locales.localeMap[locale].errors,
			req = {
				session: {
					locale: locale
				}
			},res = {
				status: function(statusCode) {
					assert.equal(statusCode, errorCode);
					return res;
				},
				json: function(model) {
					assert.equal(model.error, errors[errorKey]);
					done();
				}
			};

		errorHandler.json(req, res, errorKey, errorCode);
	});
});