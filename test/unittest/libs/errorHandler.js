'use strict';

var debug = require('debug')('indigo:test'),
	indigo = require('../../../indigo'),
	assert = require('assert');

describe('libs/errorHandler', function () {

	var appconf,
		defaultError = {'error': 'ERROR'};

	before(function (done) {
		appconf = indigo.init(__appDir + '/examples/account/config/app.json');
		indigo.logger.error = function() {};
		done();
	});

	it('should validate err is null', function (done) {
		indigo.errorHandler.render(null, null, null, function() {
			done();
		});
	});

	it('should validate invalid err argument (try/catch)', function (done) {
		indigo.errorHandler.render({ data: indigo }, null, null, function() {
			done();
		});
	});

	it('should validate err is null', function (done) {
		indigo.error(null, null, {
			status: function(statusCode) {
				assert.equal(statusCode, 400);
				return {
					json: function(error) {
						assert.equal(error, null);
						done();
					}
				};
			}
		});
	});

	it('should test _headerSent = false', function (done) {
		indigo.error(defaultError, {}, {
			_headerSent: false,
			statusCode: 500,
			status: function(statusCode) {
				assert.equal(statusCode, 500);
				return {
					render: function() {
						done();
					}
				};
			}
		}, null);
	});

	it('should test _headerSent = true', function (done) {
		indigo.error(defaultError, {}, {
			_headerSent: true,
			statusCode: 500,
			status: function(statusCode) {
				assert.equal(statusCode, 400); //ignore default error
				return {
					json: function() {
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 404', function (done) {
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, 
			{
			statusCode: 404,
			status: function(statusCode) {
				assert.equal(statusCode, 404);
				return {
					render: function(url, model) {
						assert.equal(model.errorModel.statusCode, 404);
						assert.equal(model.errorModel.message, 'Not Found');
						assert.equal(model.errorModel.details, 'The requested URL was not found on this server: <code>/foo.html</code>');
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 500', function (done) {
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, {
			statusCode: 500,
			status: function(statusCode) {
				assert.equal(statusCode, 500);
				return {
					render: function(url, model) {
						assert.equal(model.errorModel.statusCode, 500);
						assert.equal(model.errorModel.message, 'Internal Server Error');
						assert.equal(model.errorModel.details, 'The server encountered an unexpected condition.');
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 503', function (done) {
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, {
			statusCode: 503,
			status: function(statusCode) {
				assert.equal(statusCode, 503);
				return {
					render: function(url, model) {
						assert.equal(model.errorModel.statusCode, 503);
						assert.equal(model.errorModel.message, 'Service Unavailable');
						assert.equal(model.errorModel.details, 'Connection refuse.');
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 911', function (done) {
		appconf.errors.template = null;
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, {
			statusCode: 911,
			status: function(statusCode) {
				assert.equal(statusCode, 911);
				return {
					render: function(url, model) {
						assert.equal(model.errorModel.statusCode, 911);
						assert.equal(model.errorModel.message, 'IDGJS_ERROR_911');
						assert.equal(model.errorModel.details, 'Please contact your system administrator.');
						done();
					}
				};
			}
		}, null);
	});

	it('should test redirect', function (done) {
		appconf.errors['404'] = 'http://www.google.com/indigojs';
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, {
				statusCode: 404,
				redirect: function(url) {
					assert.equal(url, appconf.errors['404']);
					done();
				}
		}, null);
	});

	it('should test prevent double redirect', function (done) {
		indigo.errorHandler.notFound({
			use: function(fn) {
				fn({ 
					headers: {
						referer: 'http://notfound.html'
					}
				}, null, done);
			}
		});
	});

	it('should test custom model (req.errorModel)', function (done) {
		var error_model = {
				id: Date.now(),
				statusCode: 1234,
				message: 'CUSTOM ERROR',
				details: 'This is my custom error'
			};
		indigo.errorHandler.setErrorDetails(error_model, 'MY_ERROR_ID', defaultError);

		indigo.errorHandler.render(defaultError, {
				model: {
					errorModel: error_model
				}
			}, 
			{
				status: function(statusCode) {
					assert.equal(statusCode, error_model.statusCode);
					return {
						render: function(url, model) {
							assert.ok(url.indexOf('/indigojs/examples/templates/errors.html') !== -1);
							assert.equal(model.errorModel.uid, error_model.uid);
							assert.equal(model.errorModel.error, JSON.stringify(defaultError));
							assert.equal(model.errorModel.statusCode, error_model.statusCode);
							assert.equal(model.errorModel.message, error_model.message);
							assert.equal(model.errorModel.details, error_model.details);
							done();
						}
					};
				}
		}, null);
	});

	it('should test defined errorID', function (done) {
		var errorID = 12345,
			model = indigo.errorHandler.error(errorID);
		assert.equal(model.errorId, errorID);
		assert.ok(!isNaN(model.uid));
		done();
	});

	it('should test injectErrorHandler', function (done) {
		var error = {error:'ERROR'};
		assert.equal(indigo.errorHandler.injectErrorHandler(error).error, JSON.stringify(error));
		done();
	});

	it('should test default error 400', function (done) {
		var errorCode = 400,
			errorKey = 'invalidAccount',
			locale = 'en-us',
			errors = indigo.locales.localeMap[locale].errors,
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

		indigo.errorHandler.json(req, res, errorKey);
	});

	it('should test if error.json is missing', function (done) {
		var errorCode = 400,
			errorKey = 'invalidAccount',
			locale = 'en-us',
			errors = indigo.locales.localeMap[locale].errors,
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
					indigo.locales.localeMap[locale].errors = errors;
					assert.equal(model.error, errorKey);
					done();
				}
			};
		indigo.locales.localeMap[locale].errors = null;
		indigo.errorHandler.json(req, res, errorKey);
	});

	it('should test custom error 500', function (done) {
		var errorCode = 500,
			errorKey = 'invalidAccount',
			locale = 'ru',
			errors = indigo.locales.localeMap[locale].errors,
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

		indigo.errorHandler.json(req, res, errorKey, errorCode);
	});
});