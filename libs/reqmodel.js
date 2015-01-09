'use strict';

module.exports = function reqmodel(nconf) {
	nconf = nconf || require('nconf');

	var env = nconf.get('environment'),
		minify = env === 'dev' ? '' : '.min';

	return {
		environment: env,
		minify: minify,
		extCSS: minify + '.css',
		extJS: minify + '.js',
		locality: {},
		locales: {}
	};
};