'use strict';

var debug = require('debug')('indigo:locales'),
	indigo = require('../indigo'),
	fs = require('fs'),
	rules = require('./locales/accept-rules.json'),
	defLocale = 'en-us',
	localeMap = {};

module.exports = {

	localeMap: localeMap,

	config: function(nconf) {
		defLocale = nconf.get('locales:default') || defLocale;
		localeMap[defLocale] = { lookup: [] };

		var localeDir = __appDir + nconf.get('locales:path');
		if (fs.existsSync(localeDir)) {
			var dirs = fs.readdirSync(localeDir);
			for (var d in dirs) {
				var localeName = dirs[d];
				if (fs.lstatSync(localeDir + '/' + localeName).isDirectory()) {
					localeMap[localeName] = { lookup: [] };
					var files = fs.readdirSync(localeDir + '/' + localeName);
					for (var f in files) {
						var file = files[f],
							arr = file.split('.');
						if (arr.length > 1 && arr[1] === 'json') {
							try {
								localeMap[localeName][arr[0]] = require(localeDir + '/' + localeName + '/' + file);
							} catch (e) {
								indigo.logger.error('FILE: %s, ERROR: %s', localeDir + '/' + localeName + '/' + file, e.toString());
							}
						}
					}
				}
			}

			initLocalelookup(nconf);
		}
	},

	init: function(req, locale) {
		setLocale(req, locale);
		return localeMap[req.session.locale] || localeMap[defLocale];
	}
};

function setLocale(req, locale) {
	req.session.locale = locale || req.session.locale;

	if (!localeMap[req.session.locale]) {
		debug('sessionID=%', req.sessionID);
		if (req.headers && req.headers['accept-language']) {
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
		}
		saveToSession(req, defLocale);
	} else {
		saveToSession(req, req.session.locale);
	}
}

function saveToSession(req, locale) {
	req.session.locale = req.model.locality.locale = locale;
	if (localeMap[locale].lookup.length > 0) {
		req.model.locality.langugage = localeMap[locale].lookup[0].split('-')[0];
	} else {
		req.model.locality.langugage = locale.split('-')[0];
	}
	req.session.localeLookup = localeMap[locale].lookup.concat('default');
}

function initLocalelookup(nconf) {
	var file = __appDir + nconf.get('locales:path') + '/accept-rules.json';
	if (fs.existsSync(file)) {
		var customRules = require(file);
		for (var code in customRules) {
			rules[code] = customRules[code];
		}
	}

	function traverse(code) {
		var target = localeMap[code] = localeMap[code] || { lookup: [] };

		var lookup = rules[code];
		target.lookup = target.lookup.concat(lookup);

		for (var index in lookup) {
			var locale = lookup[index],
				source = localeMap[locale];

			if (!source) {
				source = traverse(locale);
			}

			for (var i in source.lookup) {
				locale = source.lookup[i];
				if (target.lookup.indexOf(locale) === -1) {
					target.lookup.push(locale);
				}
			}

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

		return target;
	}

	for (code in rules) {
		traverse(code);
	}
}