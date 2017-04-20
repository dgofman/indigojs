'use strict';

const indigo = global.__indigo,
	fs = require('fs'),
	rules = require('./locales/accept-rules.json'),
	cjson = require('cjson'),
	cookieName = 'localeCode',
	reCookie = RegExp(`(?:^|;\\s*)${cookieName}=([^;]*)`),
	defaultLocale = 'en-us';

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
const locales = () => {
	/** @lends libs/locales.prototype */
	return {

		/**
		 * Collection of localization objects where key points to locale code and value map 
		 * of key and value of localization messages.
		 * @type {Object}
		 */
		localeMap: {},

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
		defaultLocale,

		/**
		 * Map of locale files modified dates
		 * @type {Object}
		 */
		lastModified: {},

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
		config(appconf) {
			this.defaultLocale = appconf.get('locales:default') || defaultLocale;
			this.lastModified = {};
			this.errorFiles = {};
			this.localeMap = {};
			this.localeMap[this.defaultLocale] = { __lookup__: [], __localName__: this.defaultLocale };

			const localeDir = __appDir + (appconf.get('server:moduleDir') || '') + appconf.get('locales:path');
			if (fs.existsSync(localeDir)) {
				const dirs = fs.readdirSync(localeDir);
				for (let d in dirs) {
					let localeName = dirs[d];
					if (fs.lstatSync(`${localeDir}/${localeName}`).isDirectory()) {
						this.localeMap[localeName] = { __lookup__: [], __localName__:localeName };
						this.parse(`${localeDir}/${localeName}`, this.localeMap[localeName]);
					}
				}
			}

			localelookup(localeDir, this);
		},

		/**
		 * Loading locale files and building locales object.
		 *
		 * @param {String} dirName Absolute path to json files.
		 * @param {Object} parent Locales properties.
		 */
		parse(dirName, parent) {
			const files = fs.readdirSync(dirName);
			for (let f in files) {
				let file = files[f],
					arr = file.split('.');
				if (arr.length > 1 && arr[1] === 'json') {
					file = `${dirName}/${file}`;
					try {
						parent[arr[0]] = cjson.load(file);
						this.lastModified[file] = fs.lstatSync(file).mtime;
					} catch (e) {
						this.errorFiles[file] = e;
						indigo.logger.error('FILE: %s, ERROR: %s', file, e.toString());
					}
				} else if (fs.lstatSync(`${dirName}/${file}`).isDirectory()) {
					parent[file] = {};
					this.parse(`${dirName}/${file}`, parent[file]);
				}
			}
		},

		/**
		 * Initializing user locale by using request header.
		 * @param {express.Request} req Defines an object to provide client request information.
		 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
		 * return {String} locale Return the router locale name.
		 */
		headerLocale(req) {
			if (req.headers) {
				if (req.headers.cookie) {
					const match = req.headers.cookie.match(reCookie);
					if (match) {
						return setLocality(req, match[1], this); //set from cookies
					}
				}

				if (req.headers['accept-language']) {
					const split = req.headers['accept-language'].split(';'); // en-us,en-au;q=0.8,en;q=0.5,ru;q=0.3
					for (let value in split) {
						const languages = split[value].split(',');
						for (let name in languages) {
							let locale = languages[name].toLowerCase();
							if (!locale.includes('q=') && this.localeMap[locale]) {
								return setLocality(req, locale, this);
							}
						}
					}
				}
			}
			return setLocality(req, this.defaultLocale, this);
		},

		/**
		 * Initializing current user locale and returning locallization map of localized messages.
		 * @param {express.Request} req Defines an object to provide client request information.
		 * @param {String} [locale] User language code.
		 * @return {Object} locale Collection of localization messages.
		 */
		routeLocale(req, locale) {
			req.model.locality = req.model.locality || {};
			return setLocality(req, locale || req.model.locality.locale, this);
		},

		/**
		 * Monitor changes in locale file.
		 * @param {Object} appconf JSON object represents application configuration.
		 */
		monitor(appconf) {
			const seconds = appconf.get('locales:monitor');
			if (!seconds) {
				return;
			}

			clearInterval(this.lastModifiedInterval);
			this.lastModifiedInterval = setInterval(() => {
				for (let file in this.lastModified) {
					if (this.lastModified[file].getTime() !== fs.lstatSync(file).mtime.getTime()) {
						indigo.logger.info('File updated: ' + file);
						this.config(appconf);
						return;
					}
				}
			}, seconds * 1000);
		}
	};
};

/**
 * Save current language information to <code>req.model.locality</code>.
 * @memberof libs/locales.prototype
 * @param {express.Request} req Defines an object to provide client request information.
 * @param {String} locale User language code.
 * @param {libs/locales} locales instance class.
 * @access protected
 */
const setLocality = (req, locale, locales) => {
	locale = locales.localeMap[locale] ? locale : locales.defaultLocale;
	if (req.res && req.res.cookie) {
		req.res.cookie(cookieName, locale);
	}

	const userLocale = locales.localeMap[locale];
	req.model.locality = {
		localeLookup: userLocale.__lookup__,
		langugage: userLocale.__localName__,
		locale: locale
	};
	req.model.locales = userLocale;
	return userLocale;
};

/**
 * Traverse all locales files under locale directory.
 * @memberof libs/locales.prototype
 * @param {String} localeDir Absolute path to <code>locale</code> directory.
 * @access protected
 */
const localelookup = (localeDir, locales) => {
	const file = `${localeDir}/accept-rules.json`;
	if (fs.existsSync(file)) {
		const customRules = cjson.load(file);
		for (let code in customRules) {
			rules[code] = customRules[code];
		}
	}

	const traverse = code => {
		const target = locales.localeMap[code] = locales.localeMap[code] || { __lookup__: [], __localName__:code };

		let locale, lookup = rules[code];
		for (let index in lookup) {
			locale = lookup[index];
			if (target.__lookup__.indexOf(locale) === -1) {
				target.__lookup__.push(locale);
			}
		}

		for (let index in lookup) {
			locale = lookup[index];

			let source = locales.localeMap[locale],
				sourceLocale = true;

			if (!source) {
				source = traverse(locale);
			}

			for (let i in source.__lookup__) {
				locale = source.__lookup__[i];
				if (locale && target.__lookup__.indexOf(locale) === -1) {
					target.__lookup__.push(locale);
				}
			}

			for (let name in source) {
				if (name !== '__localName__' && name !== '__lookup__') {
					if (!target[name]) {
						target[name] = source[name];
					} else { //copy only missing key/values
						sourceLocale = false;

						for (let key in source[name]) {
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

		if (target.__lookup__.indexOf('default') === -1) {
			target.__lookup__.push('default');
		}

		return target;
	};

	for (let code in rules) {
		traverse(code);
	}
};

/**
 * @module locales
 * @see {@link libs/locales}
 */
module.exports = locales;