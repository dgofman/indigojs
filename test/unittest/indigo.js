'use strict';

var indigo = require('../../indigo'),
	assert = require('assert');

const acceptLanguage = 'en-gb, en-us';

describe('UnitTests Indigo APIs', () => {

	it('should test dynamic CONFIG_ENV setting', done => {
		let appconf;

		process.env['CONFIG_ENV'] = 'test';
		appconf = indigo.init(`${__appDir}/examples/firststep/config/app`);
		assert.equal(appconf.get('environment'), 'testing');

		process.env['CONFIG_ENV'] = '';
		appconf = indigo.init(`${__appDir}/examples/firststep/config/app`);
		assert.equal(appconf.get('environment'), 'prod');

		done();
	});

	it('should test JSON custom configuration', done => {
		const appconfig = indigo.init({parent: {child1: 1, child2: 2}});
		assert.equal(appconfig.get('parent:child1'), 1);
		assert.equal(appconfig.get('parent:child2'), 2);
		done();
	});

	it('should init app', done => {
		indigo.init(`${__appDir}/examples/account/config/app.json`);
		assert.equal(indigo.appconf.server.webdir, '/examples/account/web');
		done();
	});

	it('should verify __appDir', done => {
		assert.equal(`${fixPath(__appDir)}/test/unittest`, fixPath(__dirname));
		done();
	});

	it('should get EN-US locale (default)', done => {
		const req = {
				model: {},
				headers: {
					'accept-language': acceptLanguage
				}
			}, res = {
				render(url, model) {
					assert.equal(fixPath(url), `${fixPath(__appDir)}/examples/account/web/en/login.html`);
					assert.equal(model.locality.locale, 'en-us');
					assert.equal(model.locality.langugage, 'en-us');
					assert.equal(model.locales.account.greeting, 'Hi');
					done();
				}
			};

		indigo.render(req, res, '/login.html');
	});

	it('should get EN-GB locale (browser language)', done => {
		const req = {
				model: {},
				headers: {
					'accept-language': acceptLanguage
				}
			}, res = {
				render(url, model) {
					assert.equal(fixPath(url), `${fixPath(__appDir)}/examples/account/web/en/login.html`);
					assert.equal(model.locality.locale, 'en-gb');
					assert.equal(model.locality.langugage, 'en');
					assert.equal(model.locales.account.greeting, 'Hello');
					done();
				}
			};
		indigo.locales.headerLocale(req);

		indigo.render(req, res, '/login.html');
	});

	it('should get EN-CA locale (browser cookie)', done => {
		const req = {
				model: {},
				headers: {
					'cookie': 'localeCode=en-ca',
					'accept-language': acceptLanguage
				}
			}, res = {
				render(url, model) {
					assert.equal(fixPath(url), `${fixPath(__appDir)}/examples/account/web/en/login.html`);
					assert.equal(model.locality.locale, 'en-ca');
					assert.equal(model.locality.langugage, 'en');
					assert.equal(model.locales.account.greeting, 'Hello');
					done();
				}
			};
		indigo.locales.headerLocale(req);

		indigo.render(req, res, '/login.html');
	});

	it('should test ru locale (router parameter)', done => {
		const req = {
				params: {
					locale: 'ru'
				},
				model: {},
				headers: {
					'cookie': 'localeCode=en-ca',
					'accept-language': acceptLanguage
				}
			}, res = {
				render(url, model) {
					assert.equal(model.locality.locale, 'ru');
					assert.equal(model.locality.langugage, 'ru');
					assert.equal(model.locales.account.greeting, 'Здравствуйте');
					done();
				}
			};

		indigo.locales.headerLocale(req);

		indigo.render(req, res, '/login');
	});

	it('should test substitute', done => {
		const result = indigo.substitute('Hello {0}', ['David']);
		assert.equal(result, 'Hello David');
		done();
	});

	it('should test substitute str is null', done => {
		const result = indigo.substitute(null, ['David']);
		assert.equal(result, '');
		done();
	});

	it('should test min version', done => {
		const version = require('../../package.json').version;
		indigo.min_version(version);
		done();
	});

	it('should test min version exception', done => {
		try {
			indigo.min_version('999.999.999');
		} catch (e) {
			assert.ok(e.toString().indexOf('Error: IndigoJS unsupported minor version') !== -1);
			done();
		}
	});

	it('should test getComponentTag', done => {
		assert.equal(indigo.getComponentTag(), 'c');
		done();
	});

	it('should test getModuleWebDir', done => {
		assert.equal(indigo.getModuleWebDir({
			moduleWebDir: () => {
				return 'dir';
			}
		}), 'dir');
		done();
	});

	it('should test appconfPath', done => {
		let path = indigo.appconfPath('server:invalidProperty');
		assert.equal(path, null);

		path = indigo.appconfPath('server:webdir');
		assert.equal(fixPath(path), fixPath(`${__appDir}/examples/account/web`));
		done();
	});

	it('should get 404 status code', done => {
		const req = {
				model: {},
			},res = {
				status(code) {
					assert.equal(code, 404);
				},
				render() {
					done();
				}
			};
		
		indigo.render(req, res, '/login404');
	});

	it('should get 404 file path', done => {
		const req = {
				model: {},
			},res = {
				status(code) {
					assert.equal(code, 404);
				},
				setHeader(key, value) {
					if (key === 'path') {
						assert.equal(`${fixPath(__appDir)}/examples/account/web/login404.html`, fixPath(value));
					}
				},
				render() {
					done();
				}
			};

		indigo.render(req, res, '/login404');
	});

	it('should test getNewURL', done => {
		const req = {
				model: {
					locale: 'en'
				}
			};
		assert.equal(indigo.getNewURL(req, null, '/foo'), '/foo');
		done();
	});

	it('should test libs module(s)', done => {
		const errorHandler = require('../../libs/errorHandler');
		assert.equal(errorHandler, indigo.libs('errorHandler'));
		done();
	});

	it('should test get package.json config properties', done => {
		assert.equal(indigo.getEnv('INDOGO_DEBUG'), 'true');
		done();
	});

	it('should test get env variable', done => {
		assert.equal(indigo.getEnv('CUSTOM_VAR'), undefined);
		process.env['CUSTOM_VAR'] = 'TEST';
		assert.equal(indigo.getEnv('CUSTOM_VAR'), 'TEST');
		done();
	});

	it('should test get command line arguments', done => {
		process.env['CUSTOM_VAR'] = 'TEST1';
		assert.equal(indigo.getEnv('CUSTOM_VAR'), 'TEST1');

		process.argv.push('-myvar=TEST2');
		const args = indigo.getArgs();
		assert.equal(args['-myvar'], 'TEST2');
		done();
	});
});

function fixPath(path) {
	return path.replace(/\\/g, '/').replace(/\/\//g, '/');
}