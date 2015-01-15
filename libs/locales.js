'use strict';

var debug = require('debug')('indigo:locales'),
	indigo = require('../indigo'),
	fs = require('fs'),
	rules = require('./locales/accept-rules.json'),
	defLocale = 'en-us',
	localeMap = {};

module.exports = {

	localeMap: localeMap,
	errorFiles: {},

	/**
	 * Description
	 * @method config
	 * @param {} appconf
	 * @return 
	 */
	config: function(appconf) {
		defLocale = appconf.get('locales:default') || defLocale;
		localeMap[defLocale] = { __lookup__: [], __localName__:defLocale };

		var localeDir = __appDir + appconf.get('locales:path');
		if (fs.existsSync(localeDir)) {
			var dirs = fs.readdirSync(localeDir);
			for (var d in dirs) {
				var localeName = dirs[d];
				if (fs.lstatSync(localeDir + '/' + localeName).isDirectory()) {
					localeMap[localeName] = { __lookup__: [], __localName__:localeName };
					var files = fs.readdirSync(localeDir + '/' + localeName);
					for (var f in files) {
						var file = files[f],
							arr = file.split('.');
						if (arr.length > 1 && arr[1] === 'json') {
							try {
								localeMap[localeName][arr[0]] = require(localeDir + '/' + localeName + '/' + file);
							} catch (e) {
								this.errorFiles[localeDir + '/' + localeName + '/' + file] = e;
								indigo.logger.error('FILE: %s, ERROR: %s', localeDir + '/' + localeName + '/' + file, e.toString());
							}
						}
					}
				}
			}

			initLocalelookup(appconf);
		}
	},

	/**
	 * Description
	 * @method init
	 * @param {} req
	 * @param {} locale
	 * @return MemberExpression
	 */
	init: function(req, locale) {
		setLocale(req, locale);
		return localeMap[req.session.locale];
	}
};

/**
 * Description
 * @method setLocale
 * @param {} req
 * @param {} locale
 * @return 
 */
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

/**
 * Description
 * @method saveToSession
 * @param {} req
 * @param {} locale
 * @return 
 */
function saveToSession(req, locale) {
	req.session.locale = locale;
	req.session.localeLookup = localeMap[locale].__lookup__.concat('default');
	if (req.model) {
		req.model.locality.locale = locale;
		req.model.locality.langugage = localeMap[locale].__localName__;
	}
}

/**
 * Description
 * @method initLocalelookup
 * @param {} appconf
 * @return 
 */
function initLocalelookup(appconf) {
	var file = __appDir + appconf.get('locales:path') + '/accept-rules.json';
	if (fs.existsSync(file)) {
		var customRules = require(file);
		for (var code in customRules) {
			rules[code] = customRules[code];
		}
	}

	/**
	 * Description
	 * @method traverse
	 * @param {} code
	 * @return target
	 */
	function traverse(code) {
		var target = localeMap[code] = localeMap[code] || { __lookup__: [], __localName__:code };

		var lookup = rules[code];
		target.__lookup__ = target.__lookup__.concat(lookup);

		for (var index in lookup) {
			var locale = lookup[index],
				source = localeMap[locale],
				sourceLocale = true;

			if (!source) {
				source = traverse(locale);
			}

			for (var i in source.__lookup__) {
				locale = source.__lookup__[i];
				if (locale && target.__lookup__.indexOf(locale) === -1) {
					target.__lookup__.push(locale);
				}
			}

			for (var name in source) {
				if (name !== '__localName__' && name !== '__lookup__') {
					if (!target[name]) {
						target[name] = source[name];
					} else { //copy only missing key/values
						sourceLocale = false;

						for (var key in source[name]) {
							if (!target[name][key]) {
								 target[name][key] = source[name][key];
							}
						}
					}
				}
			}

			if (sourceLocale) {
				target.__localName__ = source.__localName__;
			}
		}

		return target;
	}

	for (code in rules) {
		traverse(code);
	}
}