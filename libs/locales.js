'use strict';

var debug = require('debug')('indigo:locales'),
	indigo = require('../indigo'),
	fs = require('fs'),
	rules = require('./locales/accept-rules.json'),
	defaultLocale = 'en-us',
	localeMap = {};

/**
 * This module exposes the locale-determination logic for resource 
 * bundles implementation that needs to produce localized messages.
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/locales
 * @requires ./locales/accept-rules.json
 */
var locales = 
	/** @lends libs/locales.prototype */
	{

	/**
	 * Collection of localization objects where key points to locale code and value map 
	 * of key and value of localization messages.
	 * @type {Object}
	 */
	localeMap: localeMap,

	/**
	 * Collection of expections during parsering the locale files, where key is file 
	 * name and value is error object.
	 * @type {Object}
	 */
	errorFiles: {},

	/**
	 * Default language code 
	 * @type {String}
	 */
	defLocale: {},

	/**
	 * This method executed once reading <code>locales</code> setting defined in appconf.json 
	 * and building tree of locale messages <code>localeMap</code> at start time.
	 *
	 * @example
	 * conf/app.json 
	 *{
	 *	...
	 *	"locales": {
	 *		"default": "en-us",
	 *		"path": "/src/locales"
	 *	}
	 *	...
	 *}
	 * @param {Object} appconf JSON object represents application configuration.
	 */
	config: function(appconf) {
		this.defLocale = appconf.get('locales:default') || defaultLocale;
		localeMap[this.defLocale] = { __lookup__: [], __localName__: this.defLocale };

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

			localelookup(appconf);
		}
	},

	/**
	 * Initializing current user locale and returning locallization map of localized messages.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {String} [locale] User language code.
	 * @return {Object} locale Collection of localization messages.
	 */
	init: function(req, locale) {
		setLocale(req, locale);
		return localeMap[req.session.locale];
	}
};

/**
 * Determine user language code base on URL parameter or browser language settings.
 * @memberof libs/locales.prototype
 * @param {express.Request} req Defines an object to provide client request information.
 * @param {String} [locale] User language code.
 * @access protected
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
		saveToSession(req, this.defLocale);
	} else {
		saveToSession(req, req.session.locale);
	}
}

/**
 * Save current language code into <code>express.Request</code> session.
 * @memberof libs/locales.prototype
 * @param {express.Request} req Defines an object to provide client request information.
 * @param {String} locale User language code.
 * @access protected
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
 * Traverse all locales files under locale directory.
 * @memberof libs/locales.prototype
 * @param {Object} appconf JSON object represents application configuration.
 * @access protected
 */
function localelookup(appconf) {
	var file = __appDir + appconf.get('locales:path') + '/accept-rules.json';
	if (fs.existsSync(file)) {
		var customRules = require(file);
		for (var code in customRules) {
			rules[code] = customRules[code];
		}
	}

	var traverse = function(code) {
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
	};

	for (code in rules) {
		traverse(code);
	}
}

/**
 * @module locales
 * @see {@link libs/locales}
 */
module.exports = locales;