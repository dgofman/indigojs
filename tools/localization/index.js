'use strict';

var indigo = require('../../indigo');

if (!indigo.appconf) {
	indigo.start(__appDir + '/tools/localization/config/app.json');
}