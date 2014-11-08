'use strict';

module.exports = function reqmodel(nconf) {
	return {
		environment: nconf.get('environment'),
		locality: {},
		locales: {}
	};
};