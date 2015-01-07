'use strict';

module.exports = function reqmodel(nconf) {
	nconf = nconf || require('nconf');
	return {
		environment: nconf.get('environment'),
		css: nconf.get('environment') === 'dev' ? '.css' : '.min.css',
		locality: {},
		locales: {}
	};
};