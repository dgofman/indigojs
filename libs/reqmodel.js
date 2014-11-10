'use strict';

module.exports = function reqmodel(nconf) {
	nconf = nconf || require('nconf');
	return {
		environment: nconf.get('environment'),
		locality: {},
		locales: {}
	};
};