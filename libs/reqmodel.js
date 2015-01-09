'use strict';

module.exports = function reqmodel(nconf) {
	nconf = nconf || require('nconf');
	return {
		environment: nconf.get('environment'),
		extCSS: nconf.get('environment') === 'dev' ? '.css' : '.min.css',
		extJS: nconf.get('environment') === 'dev' ? '.js' : '.min.js',
		locality: {},
		locales: {}
	};
};