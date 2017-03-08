'use strict';

const locales = require('../../../libs/locales')(),
	fs = require('fs'),
	indigo = require('../../../indigo'),
	assert = require('assert');

describe('libs/locales', () => {

	const appconf = indigo.init(`${__appDir}/examples/account/config/app.json`);

	it('should skip not json files', done => {
		const fileName = `${__appDir}/examples/account/locales/en/invalid.js`;
		fs.writeFileSync(fileName, 'HELLO WORLD');
		locales.config(appconf);
		fs.unlinkSync(fileName);
		done();
	});

	it('should test try/catch', done => {
		indigo.logger.error = () => {};
		const fileName = `${__appDir}/examples/account/locales/en/invalid.json`;
		fs.writeFileSync(fileName, 'HELLO WORLD');
		locales.config(appconf);
		fs.unlinkSync(fileName);
		assert.ok(locales.errorFiles[fileName].name.includes('Error'));
		done();
	});

	it('should test invalid Accept-Language code', done => {
		const req = {
				session: {},
				headers: {
					'accept-language': 'ZZ'
				}
			};
		locales.init(req);
		assert.equal(req.session.locale, 'en-us');
		done();
	});

	it('should test locales monitor', done => {
		appconf.locales.monitor = 0.1;
		locales.config(appconf);
		for (const file in locales.lastModified) {
			locales.lastModified[file] = new Date();
			break;
		}
		locales.monitor(appconf);
		setTimeout(done, 500);
	});
});