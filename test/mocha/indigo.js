'use strict';

var superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo'),
	errorHandler = require('../../libs/errorHandler');

describe('Testing Indigo API\'s', function () {

	it('should test before/after callbacks', function(done) {
		indigo.start(__appDir +  '/examples/firststep/config/app.json', 
			function(http, app) {
					assert.equal(app, indigo.app);
			}, function(http, app) {
				assert.equal(app, indigo.app);
				indigo.close(done);
		});
	});

	it('should test app.locals.inject', function(done) {
		indigo.start(__appDir +  '/examples/firststep/config/app.json', null, function() {
			var port = indigo.appconf.get('server:port');
			var req = superagent.get('http://localhost:' + port + '/firststep/index')
				.end(function() {
					var injectErrorHandler = errorHandler.injectErrorHandler;
					errorHandler.injectErrorHandler = function() {
						return {
							code: 0,
							error: 'Not Found',
							message: 'PAGE NOT FOUND'
						};
					};

					req.session = {locale:'en'};
					assert.equal(indigo.app.locals.inject(req, '/foo'), 'PAGE NOT FOUND');
					errorHandler.injectErrorHandler = injectErrorHandler;
					indigo.close(done);
			});
		});
	});

	it('should test dynamic module', function (done) {
		var appconf = indigo.getAppConf(__appDir +  '/examples/firststep/config/app.json');
		appconf.modules = [ 'mymodule' ];
		indigo.start(appconf, null, function() {
			indigo.close(done);
		});
	});

	it('should test rendering error', function (done) {
		indigo.start(__appDir +  '/examples/firststep/config/app.json', null, function() {
			var port = indigo.appconf.get('server:port');
			superagent.get('http://localhost:' + port + '/firststep/invalidTemplate')
				.end(function() {
					indigo.close(done);
			});
		});
	});
});
