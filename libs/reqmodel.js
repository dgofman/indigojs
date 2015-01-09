'use strict';

module.exports = function reqmodel(nconf) {
	nconf = nconf || require('nconf');

	var minify = nconf.get('environment') === 'dev' ? '' : '.min';

	return {
		environment: nconf.get('environment'),
		minify: minify,
		extCSS: minify + '.css',
		extJS: minify + '.js',
		locality: {},
		locales: {}
	};
};