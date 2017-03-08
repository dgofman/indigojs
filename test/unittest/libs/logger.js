'use strict';

const logger = require('../../../libs/logger'),
	assert = require('assert');

describe('libs/logger', () => {

	it('should get default logger level', done => {
		const log = logger({get() {
			return null;
		}});
		assert.equal(log.getLevel(), 'debug');
		done();
	});

	it('should get info logger lever', done => {
		const log = logger({get() {
			return 'info';
		}});
		assert.equal(log.getLevel(), 'info');
		done();
	});

	it('should change logger lever', done => {
		const log = logger({get() {
			return 'info';
		}});
		log.setLevel('error');
		assert.equal(log.getLevel(), 'error');
		done();
	});
});