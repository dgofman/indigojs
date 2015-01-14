'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo'),
	errorHandler = require('../../libs/errorHandler');

describe('Testing Indigo API\'s', function () {

	before(function (done) {
		indigo.start(__appDir +  '/examples/firststep/config/app.json', 
			function(http, app) {
				assert.equal(app, indigo.app);
		}, function(http, app){
			assert.equal(app, indigo.app);
		});
		done();
	});

	after(function(done) {
		indigo.close(done);
	});

	it('should test app.locals.inject', function(done){
		var req = superagent.get('http://localhost:8787/firststep/index')
			.end(function() {
				var injectErrorHandler = errorHandler.injectErrorHandler;
				errorHandler.injectErrorHandler = function(err) {
					return {
						code: 0,
						error: 'Not Found',
						message: 'PAGE NOT FOUND'
					};
				};

				req.session = {locale:'en'};
				assert.equal(indigo.app.locals.inject(req, '/foo'), 'PAGE NOT FOUND');
				errorHandler.injectErrorHandler = injectErrorHandler;
				done();
		});
	});
});
