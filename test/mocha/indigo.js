'use strict';

const superagent = require('superagent'),
	assert = require('assert'),
	indigo = require('../../indigo');

describe('Testing Indigo API\'s', () => {

	it('should test before/after callbacks', done => {
		indigo.start(`${__appDir}/examples/firststep/config/app.json`, 
			(http, app) => {
					assert.equal(app, indigo.app);
			}, (http, app) => {
				assert.equal(app, indigo.app);
				indigo.close(done);
		});
	});

	it('should test app.locals.inject', done => {
		indigo.start(`${__appDir}/examples/firststep/config/app.json`, null, () => {
			const port = indigo.appconf.get('server:port');
			const req = superagent.get(`http://localhost:${port}/firststep/index`)
				.end(() => {
					const injectErrorHandler = indigo.errorHandler.injectErrorHandler;
					indigo.errorHandler.injectErrorHandler = () => ({
						code: 0,
						error: 'Not Found',
						message: 'PAGE NOT FOUND'
					});

					req.session = {locale:'en'};
					assert.equal(indigo.app.locals.inject(req, '/foo'), 'PAGE NOT FOUND');
					indigo.errorHandler.injectErrorHandler = injectErrorHandler;
					indigo.close(done);
			});
		});
	});

	it('should test dynamic module', done => {
		const appconf = indigo.getAppConf(`${__appDir}/examples/firststep/config/app.json`);
		appconf.modules = [ 'mymodule' ];
		indigo.start(appconf, null, () => {
			indigo.close(done);
		});
	});

	it('should test rendering error with error_verbose=false', done => {
		indigo.start(`${__appDir}/examples/firststep/config/app.json`, null, () => {
			indigo.logger.error = () => {};
			const port = indigo.appconf.get('server:port');
			superagent.get(`http://localhost:${port}/firststep/invalidTemplate`)
				.set('error_verbose', false)
				.end(() => {
					indigo.close(done);
			});
		});
	});
});