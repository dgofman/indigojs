'use strict';

(function() {

	var indigo = require('../../indigo'),
		nconf = require('nconf').
					use('file', { file: __dirname + '/config/app.json' });

	indigo.start(nconf);
})();