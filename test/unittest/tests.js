'use strict';

var indigo = require('../../indigo'),
	nconf = require('nconf').
				use('file', { file: __appDir + '/examples/config/app.json' });

indigo.start(nconf, function() {
	require('./indigo');
	require('./libs/session');
});