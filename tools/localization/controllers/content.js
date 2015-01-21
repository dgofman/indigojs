'use strict';

var fs = require('fs'),
	indigo = require('../../../indigo'),
	locales = require('../../../libs/locales'),
	langcode = require('../../../libs/locales/langcode.json');

module.exports = function(router) {

	var sortLangCode = [];
	for (var code in langcode) {
		sortLangCode.push([code, langcode[code]]);
	}
	sortLangCode = sortLangCode.sort(function(a, b) {
		if(a[1] < b[1]) return -1;
		if(a[1] > b[1]) return 1;
		return 0;
	});

	router.get('/:locale/index', function(req, res) {
		req.model.defaultLocale = {key: locales.defLocale.toLowerCase(), name: langcode[locales.defLocale]};
		req.model.filters = fileList();
		req.model.langcode = sortLangCode;

		indigo.render(req, res, '/index');
	});
};

function fileList() {
	var list = [],
		localeDir = __appDir + indigo.appconf.get('locales:path');
	if (fs.existsSync(localeDir)) {
		var dirs = fs.readdirSync(localeDir);
		for (var d in dirs) {
			var localeName = dirs[d];
			if (fs.lstatSync(localeDir + '/' + localeName).isDirectory()) {
				var files = fs.readdirSync(localeDir + '/' + localeName);
				for (var f in files) {
					var file = files[f],
						arr = file.split('.');
					if (arr.length > 1 && arr[1] === 'json') {
						try {
							require(localeDir + '/' + localeName + '/' + file);
							list.push(localeName + '/' + file);
						} catch (e) {
							indigo.logger.error('FILE: %s, ERROR: %s', localeDir + '/' + localeName + '/' + file, e.toString());
						}
					}
				}
			}
		}
	}

	return list;
}