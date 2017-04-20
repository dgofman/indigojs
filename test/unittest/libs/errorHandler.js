'use strict';

const debug = require('debug')('indigo:test'),
	indigo = require('../../../indigo'),
	assert = require('assert');

describe('libs/errorHandler', () => {
	let appconf;
	const defaultError = {'error': 'ERROR'};

	before(done => {
		appconf = indigo.init(`${__appDir}/examples/account/config/app.json`);
		done();
	});

	beforeEach(done => {
		indigo.logger.error = () => {};
		done();
	});

	it('should validate err is null', done => {
		indigo.errorHandler.render(null, null, null, () => {
			done();
		});
	});

	it('should validate invalid err argument (try/catch)', done => {
		indigo.errorHandler.render({ data: indigo }, null, null, () => {
			done();
		});
	});

	it('should test (try/catch)', done => {
		const errorHandler = indigo.errorHandler;
		indigo.errorHandler = null;
		indigo.logger.error = (err) => {
			assert.equal(err.toString(), 'TypeError: Cannot read property \'status\' of undefined');
			indigo.errorHandler = errorHandler;
			done();
		};
		indigo.error();
	});

	it('should validate err is null', done => {
		indigo.error(null, null, {
			status(statusCode) {
				assert.equal(statusCode, 400);
				return {
					json(error) {
						assert.equal(error, null);
						done();
					}
				};
			}
		});
	});

	it('should test _headerSent = false', done => {
		indigo.error(defaultError, {}, {
			_headerSent: false,
			statusCode: 500,
			status(statusCode) {
				assert.equal(statusCode, 500);
				return {
					render() {
						done();
					}
				};
			}
		}, null);
	});

	it('should test _headerSent = true', done => {
		indigo.error(defaultError, {}, {
			_headerSent: true,
			statusCode: 500,
			status(statusCode) {
				assert.equal(statusCode, 400); //ignore default error
				return {
					json() {
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 404', done => {
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, 
			{
			statusCode: 404,
			status(statusCode) {
				assert.equal(statusCode, 404);
				return {
					render(url, model) {
						assert.equal(model.errorModel.statusCode, 404);
						assert.equal(model.errorModel.message, 'Not Found');
						assert.equal(model.errorModel.details, 'The requested URL was not found on this server: <code>/foo.html</code>');
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 500', done => {
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, {
			statusCode: 500,
			status(statusCode) {
				assert.equal(statusCode, 500);
				return {
					render(url, model) {
						assert.equal(model.errorModel.statusCode, 500);
						assert.equal(model.errorModel.message, 'Internal Server Error');
						assert.equal(model.errorModel.details, 'The server encountered an unexpected condition.');
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 503', done => {
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, {
			statusCode: 503,
			status(statusCode) {
				assert.equal(statusCode, 503);
				return {
					render(url, model) {
						assert.equal(model.errorModel.statusCode, 503);
						assert.equal(model.errorModel.message, 'Service Unavailable');
						assert.equal(model.errorModel.details, 'Connection refuse.');
						done();
					}
				};
			}
		}, null);
	});

	it('should validate err 911', done => {
		appconf.errors.template = null;
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, {
			statusCode: 911,
			status(statusCode) {
				assert.equal(statusCode, 911);
				return {
					render(url, model) {
						assert.equal(model.errorModel.statusCode, 911);
						assert.equal(model.errorModel.message, 'IDGJS_ERROR_911');
						assert.equal(model.errorModel.details, 'Please contact your system administrator.');
						done();
					}
				};
			}
		}, null);
	});

	it('should test redirect', done => {
		appconf.errors['404'] = 'http://www.google.com/indigojs';
		indigo.errorHandler.render(defaultError, {
				url: '/foo.html'
			}, {
				statusCode: 404,
				redirect(url) {
					assert.equal(url, appconf.errors['404']);
					done();
				}
		}, null);
	});

	it('should test prevent double redirect', done => {
		indigo.errorHandler.notFound({
			use(fn) {
				fn({ 
					headers: {
						referer: 'http://notfound.html'
					}
				}, null, done);
			}
		});
	});

	it('should test custom model (req.errorModel)', done => {
		const error_model = {
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
				status(statusCode) {
					assert.equal(statusCode, error_model.statusCode);
					return {
						render(url, model) {
							assert.ok(url.includes('/indigojs/examples/templates/errors.html'));
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

	it('should test defined errorID', done => {
		const errorID = 12345,
			model = indigo.errorHandler.error(errorID);
		assert.equal(model.errorId, errorID);
		assert.ok(!isNaN(model.uid));
		done();
	});

	it('should test injectErrorHandler', done => {
		const error = {error:'ERROR'};
		assert.equal(indigo.errorHandler.injectErrorHandler(error).error, JSON.stringify(error));
		done();
	});

	it('should test default error 400', done => {
		const errorCode = 400,
			errorKey = 'invalidAccount',
			locale = 'en-us',
			errors = indigo.locales.localeMap[locale].errors,
			req = {
				model: {
					locality: {
						locale
					}
				}
			}, res = {
				status(statusCode) {
					assert.equal(statusCode, errorCode);
					return res;
				},
				json(model) {
					debug('error: %s', errors[errorKey]);
					assert.equal(model.error, errors[errorKey]);
					done();
				}
			};

		indigo.errorHandler.json(req, res, errorKey);
	});

	it('should test if error.json is missing', done => {
		const errorCode = 400,
			errorKey = 'invalidAccount',
			locale = 'en-us',
			errors = indigo.locales.localeMap[locale].errors,
			req = {
				model: {
					locality: {
						locale
					}
				}
			}, res = {
				status(statusCode) {
					assert.equal(statusCode, errorCode);
					return res;
				},
				json(model) {
					indigo.locales.localeMap[locale].errors = errors;
					assert.equal(model.error, errorKey);
					done();
				}
			};

		indigo.locales.localeMap[locale].errors = null;
		indigo.errorHandler.json(req, res, errorKey);
	});

	it('should test custom error 500', done => {
		const errorCode = 500,
			errorKey = 'invalidAccount',
			locale = 'ru',
			errors = indigo.locales.localeMap[locale].errors,
			req = {
				model: {
					locality: {
						locale
					}
				}
			}, res = {
				status(statusCode) {
					assert.equal(statusCode, errorCode);
					return res;
				},
				json(model) {
					assert.equal(model.error, errors[errorKey]);
					done();
				}
			};

		indigo.errorHandler.json(req, res, errorKey, errorCode);
	});
});