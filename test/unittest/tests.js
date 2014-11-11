'use strict';

var indigo = require('../../indigo'),
	nconf = require('nconf').
				use('file', { file: __appDir + '/examples/account/config/app.json' });

indigo.init(nconf);
require('./indigo');
require('./libs/session');
require('./libs/routers');
