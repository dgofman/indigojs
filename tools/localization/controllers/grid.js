'use strict';

var fs = require('fs'),
	indigo = require('../../../indigo'),
	debug = indigo.debug('indigo:localization');

module.exports = function(router) {

	router.post('/save', function(req, res) {
		try {
			var localeDir = __appDir + indigo.appconf.get('locales:path');
			if (fs.existsSync(localeDir)) {
				var filePath = req.body.filePath,
					dir = localeDir + '/' + filePath.split('/')[0];
				if (!fs.existsSync(dir)) {
					fs.mkdirSync(dir);
				}
				fs.writeFileSync(localeDir + '/' + filePath, JSON.stringify(req.body.data, null, 4));
				res.json({status:'SUCCESS'});
			}
		} catch (err) {
			debug(err);
			res.status(400).json( { error: err} );
		}
	});
};