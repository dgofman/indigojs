'use strict';

var fs = require('fs'),
	logger = require('./logger'),
	defLocale = 'en-us',
	localeMap = {};

module.exports = {

	config: function(nconf) {
		defLocale = nconf.get('locales:default') || defLocale;
		localeMap[defLocale] = {};

		var localeDir = __appDir + nconf.get('locales:directory') ;
		if (!fs.existsSync(localeDir)) {
			logger.warn('Invalid locale directory:', localeDir);
		} else {
			var dirs = fs.readdirSync(localeDir);
			for (var d in dirs) {
				var localeName = dirs[d];
				if (fs.lstatSync(localeDir + '/' + localeName).isDirectory()) {
					localeMap[localeName] = {};
					var files = fs.readdirSync(localeDir + '/' + localeName);
					for (var f in files) {
						var file = files[f],
							arr = file.split('.');
						if (arr.length > 1 && arr[1] === 'json') {
							localeMap[localeName][arr[0]] = require(localeDir + '/' + localeName + '/' + file);
						}
					}
				}
			}
		}
	},

	init: function(req) {
		setLocale(req);
		return localeMap[req.session.locale];
	},

	apply: function(req, fileName) {
		var locale = localeMap[req.session.locale] || localeMap[defLocale];
		return req.model.locales[fileName] = locale[fileName];
	}
};

function setLocale(req) {
	if (!req.session.locale) {
		logger.debug('locales::setLocale sessionID=', req.sessionID);
		var split = req.headers['accept-language'].split(';'); // en-us,en-au;q=0.8,en;q=0.5,ru;q=0.3
		for (var value in split) {
			var languages = split[value].split(',');
			for (var name in languages) {
				var locale = languages[name].toLowerCase();
				if (locale.indexOf('q=') === -1 && fs.existsSync(__dirname + '/' + locale)) {
					return saveToSession(req, locale);
				}
			}
		}
		saveToSession(req, defLocale);
	} else {
		saveToSession(req, req.session.locale);
	}
}

function saveToSession(req, locale) {
	req.session.locale = locale;
	req.model.langugage = locale.split('-')[0];
}