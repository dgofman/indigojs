'use strict';

(function() {

	var indigo = require('../../indigo'),
		appconf = require('cjson').load(__dirname + '/config/app.json');

	indigo.start(appconf);
})();