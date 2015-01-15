'use strict';

var errorHandler = require('../../../libs/errorHandler'),
	indigo = require('../../../indigo'),
	assert = require('assert');

describe('libs/errorHandler', function () {

	var appconf = indigo.init(__appDir + '/examples/account/config/app.json');

	it('should validate err is null', function (done) {
		errorHandler(null)(null, null, null, function() {
			done();
		});
	});

	it('should validate err 404', function (done) {
		errorHandler(appconf)(true, {
				url: '/foo.html'
			}, 
			{
			statusCode: 404,
			render: function(url, model) {
				assert.equal(model.code, 404);
				assert.equal(model.message, 'Not Found');
				assert.equal(model.details, 'The requested URL was not found on this server: <code>/foo.html</code>');
				done();
			}
		}, null);
	});

	it('should validate err 500', function (done) {
		errorHandler(appconf)(true, null, {
			statusCode: 500,
			render: function(url, model) {
				assert.equal(model.code, 500);
				assert.equal(model.message, 'Internal Server Error');
				assert.equal(model.details, 'The server encountered an unexpected condition.');
				done();
			}
		}, null);
	});

	it('should validate err 503', function (done) {
		errorHandler(appconf)(true, null, {
			statusCode: 503,
			render: function(url, model) {
				assert.equal(model.code, 503);
				assert.equal(model.message, 'Service Unavailable');
				assert.equal(model.details, 'Connection refuse.');
				done();
			}
		}, null);
	});

	it('should validate err 911', function (done) {
		errorHandler(appconf)(true, null, {
			statusCode: 911,
			render: function(url, model) {
				assert.equal(model.code, 911);
				assert.equal(model.message, 'System Error');
				assert.equal(model.details, 'Please contact your system administrator.');
				done();
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

	it('should test lessErrorHandler', function (done) {
		var error = {error:'ERROR'};
		assert.equal(errorHandler.lessErrorHandler(error).error, error.toString());
		done();
	});
});