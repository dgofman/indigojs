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

			//initLocaleDependencies(nconf);
		}
	},

	init: function(req, locale) {
		setLocale(req, locale);
		return localeMap[req.session.locale];
	},

	apply: function(req, fileName) {
		var locale = localeMap[req.session.locale] || localeMap[defLocale];
		return req.model.locales[fileName] = locale[fileName];
	}
};

function setLocale(req, locale) {
	req.session.locale = locale || req.session.locale;

	if (!req.session.locale) {
		logger.debug('locales::setLocale sessionID=', req.sessionID);
		var split = req.headers['accept-language'].split(';'); // en-us,en-au;q=0.8,en;q=0.5,ru;q=0.3
		for (var value in split) {
			var languages = split[value].split(',');
			for (var name in languages) {
				locale = languages[name].toLowerCase();
				if (locale.indexOf('q=') === -1 && localeMap[locale]) {
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
	req.session.locale = req.model.locality.locale = locale;
	req.model.locality.langugage = locale.split('-')[0];
}

function initLocaleDependencies(nconf) {
	if (nconf.get('locales:rules')) {
		var rules = require(__appDir + nconf.get('locales:rules'));
		for (var code in rules) {
			var target = localeMap[code] = localeMap[code] || {};

			var dependencies = rules[code];
			for (var index in dependencies) {
				var locale = dependencies[index],
					source = localeMap[locale] || {};

				for (var name in source) {
					if (!target[name]) {
					 	target[name] = source[name];
					} else { //copy only missing key/values
					 	for (var key in source[name]) {
					 		if (!target[name][key]) {
					 			 target[name][key] = source[name][key];
					 		}
					 	}
					}
				}
			}
		}
	}
}