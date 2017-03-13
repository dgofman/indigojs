'use strict';

const debug = require('debug')('indigo:main'),
	express = require('express'),
	ejs = require('ejs'),
	fs = require('fs'),
	less = require('less');

var reqModel, http,
	routers, errorHandler,
	webdir, logger, locales;

/**
 * indigoJS is the simplest localization and templating framework running on node platform.
 *
 * indigoJS is a flexible library, allowing multiple configurations from 
 * the JSON file. By default indigoJS assigns a server port number from a system environment
 * <code>process.env.INDIGO_PORT</code> if this varible is not defined on the host server, indigoJS reads
 * the server properties from the JSON file. 
 *
 * The <code>cache</code> property sets the header cache value for static files (in the seconds). 
 * By assigning it to zero it will prevent browser from caching.
 *
 * The property <code>webdir</code> specifies path to the all web static resources.
 *
 * By defining the <code>environment</code> variable as <code>prod</code> indigo including a minifying version of
 * the static resources (*.min.js, *.min.css, compressed less) that simulates file output in deployed server, by
 * default the value set's to <code>dev</code>.
 *
 * @example
 * conf/app.json 
 *{
 *	"server": {
 *		"port": 8585,
 *		"cache": 86400,
 *		"webdir": "/examples/account/web",
 *		...
 *	},
 *	"environment": "dev"
 *	...
 *}
 *
 * @version 1.0
 *
 * @module
 * @mixin indigo
 */
const indigo = 
	/** @lends indigo.prototype */
	{

	/**
	 * Creating <code>appconf</code> object.
	 * @param {JSON|String} appconf Path to the <code>app.json</code> file or application configuration object.
	 * @return {Object} appconf Return reference to the configuration object.
	 */
	getAppConf(appconf) {
		if (typeof(appconf) === 'string') { //path to app.json
			debug('indigo.init appconf - %s', appconf);
			if (appconf.indexOf('.json') === -1) {
				const env = (process.env.CONFIG_ENV || '').toLowerCase().trim();
				if (fs.existsSync(appconf + '-' + env + '.json')) {
					appconf += '-' + env + '.json';
				} else {
					appconf += '.json';
				}
			}

			appconf = require('cjson').load(appconf);
		}

		appconf.environment = appconf.environment  || 'dev';

		appconf.get = function(path) {
			let value = this,
				keys = path.split(':');
			for (let i = 0; i < keys.length; i++) {
				if (value) {
					value = value[keys[i]];
				}
			}
			return value;
		};

		return appconf;
	},

	/**
	 * Initialization of module members by using JSON configuration object.
	 * @param {JSON|String} appconf Path to the <code>app.json</code> file or application configuration object.
	 * @return {Object} appconf Return reference to the  configuration object.
	 */
	init(appconf) {
		/**
		 * JSON object represents application configuration.
		 * @memberof indigo
		 * @alias appconf
		 * @type {Object}
		 */
		this.appconf = appconf = this.getAppConf(appconf);

		webdir = __appDir + appconf.get('server:webdir');

		this.app = express();

		/**
		 * Reference to <code>libs/locales</code>.
		 * @memberof indigo
		 * @alias locales
		 * @type {Object}
		 */
		this.locales = locales = require('./libs/locales')();

		/**
		 * Reference to logging API's.
		 * @memberof indigo
		 * @alias logger
		 * @type {Object}
		 */
		this.logger = logger = require(this.appconfPath('logger:path') || './libs/logger')(appconf);
		
		this.reqModel = reqModel = require(this.appconfPath('server:reqmodel:path') || './libs/reqmodel')(appconf);

		this.errorHandler = errorHandler = require(this.appconfPath('errors:path') || './libs/errorHandler')();

		routers = require('./libs/routers');

		const service = require(this.appconfPath('service:path') || './libs/rest')();

		/**
		 * Reference to REST-based api.
		 * @memberof indigo
		 * @alias service
		 * @type {Object}
		 */
		if (!this.service) {
			Object.defineProperty(this, 'service', {
				get() { return Object.create(service).init(appconf.get('service')); },
				enumerable: true
			});
		}

		this.portNumber = Number(process.env.INDIGO_PORT || appconf.get('server:port'));

		locales.config(appconf); //initialize locales
		locales.monitor(appconf); //check file changes

		return appconf;
	},

	/**
	 * Starting a server. It is called after the init method.
	 * @example
	 * require('indigojs').start(__dirname + '/config/app.json', 
	 *	function(http, app) { //before
	 *	},
	 *	function(http, app) { //after
	 *	}
	 * });
	 *
	 * @example
	 * require('indigojs').start({server:80, webdir:"/web"});
	 *
	 * @param {JSON|String} appconf Path to the app.json file or application configuration object.
	 * @param {Function} [before] Callback function before starting http server.
	 * @param {Function} [after] Callback function after server started.
	 */
	start(appconf, before, after) {

		appconf = this.init(appconf);

		const app = this.app;

		this.static('/', webdir);

		this.static(this.getStaticDir(), webdir + '/static');

		this.addRoute(appconf, locales, reqModel);

		const addTitle = function(req, title) {
			title = title || this.title;
			return ` tabindex="${req.model.componentIndex}"` + (title ? ' title="' + title + '"' : '');
		}, getProps = function(name, val) {
			if (this[name] !== undefined) {
				if (val === undefined) {
					return ` ${this[name]}`;
				} else {
					return ` ${val}`;
				}
			}
			return '';
		}, getAttr = function(name, tagName) {
			if (this[name] !== undefined) {
				if (tagName === undefined) {
					return ` ${name}="${this[name]}"`;
				} else {
					return ` ${tagName}="${this[name]}"`;
				}
			}
			return '';
		}, getCss = function(name, tagName) {
			if (this[name] !== undefined) {
				if (tagName === undefined) {
					return ` ${name}: ${this[name]};`;
				} else {
					return ` ${tagName}: ${this[name]};`;
				}
			}
			return '';
		}, jsRender = function(data, wrapTag, className) {
			return `var handler = function() {(${data})(window.jQuery, window.jQuery('${wrapTag}.${className}'), '${wrapTag}', '${className}');};
if (window.addEventListener) {
	window.addEventListener('JQueryReady', handler, false); 
} else if (window.attachEvent)  {
	window.attachEvent('onJQueryReady', handler);
}`;};

		app.get(`${this.getComponentURL()}/:file`, (req, res) => {
			const arr = req.params.file.split('.'),
				className = arr[0],
				cache = parseInt(indigo.appconf.get('server:cache')),
				fileURL = indigo.getNewURL(req, null, `/${req.session.locale}/components/${className}/${req.params.file}`, true);
			if (fileURL === true) {
				return res.status(404).end();
			}

			fs.readFile(getModuleWebDir(req) + fileURL, (error, data) => {
				if (error) {
					indigo.error(error);
					return res.status(404).end();
				} else {
					res.setHeader('Cache-Control', 'public, max-age=' + (!isNaN(cache) ? cache : 3600)); //or one hour

					if (arr[1]=== 'js') {
						res.set('Content-Type', 'application/javascript');
						res.write(jsRender(data, indigo.getComponentTag(), className));
						res.end();
					} else {
						less.render(`${indigo.getComponentTag()}.${className} {\n${data.toString()}\n}`, {
							filename: fileURL,
							compress: indigo.appconf.get('environment') !== 'dev',
							paths: ['web/default']
						}, (e, result) => {
							res.set('Content-Type', 'text/css');
							if (e) {
								indigo.logger.error(`LESS Parse Error: ${fileURL}\n`, JSON.stringify(e, null, 2));
								res.send(data);
							} else {
								res.write(result.css);
								res.end();
							}
						});
					}
				}
			});
		});

		/**
		 * @memberOf sourceloader
		 * @alias indigo.js#localsInject
		 */
		app.locals.inject = (req, url) => {
			debug(req.method, url);
			const newUrl = indigo.getNewURL(req, null, `/${req.session.locale}/${url}`, '/${url}');
			debug('inject: %s -> %s', url, newUrl);
			try {
				req.model.filename = getModuleWebDir(req) + newUrl;
				req.model.locale = app.locals.locale;
				req.model.inject = app.locals.inject;
				req.model.component = req.model.$ = app.locals.component;
				return ejs.render(fs.readFileSync(req.model.filename, 'utf-8'), req.model);
			} catch(err) {
				indigo.logger.error(err);
				return errorHandler.injectErrorHandler(err, req, url).message;
			}
		};

		/**
		 * @memberOf sourceloader
		 * @alias indigo.js#localsComponent
		 */	
		app.locals.component = app.locals.$ = (req, className, opts={}, wrapTag) => {
			const cTag = wrapTag || indigo.getComponentTag();
			debug(req.method, className);
			const newUrl = indigo.getNewURL(req, null, `/${req.session.locale}/components/${className}/${className}.html`, true);
			debug('inject: %s -> %s, opts: %s', className, newUrl, JSON.stringify(opts));
			if (newUrl === true) {
				indigo.logger.error(`Component is not defined: ${className}`);
				return '';
			}
			try {
				opts.$get = getProps;
				opts.$attr = getAttr;
				opts.$css = getCss;
				opts.$title = addTitle;
				req.model.opts = opts;
				req.model.componentIndex = req.model.componentIndex || 1;
				req.model.filename = getModuleWebDir(req) + newUrl;
				req.model.locale = app.locals.locale;
				req.model.component = req.model.$ = app.locals.component;
				req.model.assets = req.model.assets || {};
				let html = ejs.render(fs.readFileSync(req.model.filename, 'utf-8'), req.model),
					assetKey = wrapTag ? `${cTag}_${className}` : className,
					title = '';

				if (!req.model.assets[assetKey]) {
					req.model.assets[assetKey] = {className, wrapTag};					
				}
				req.model.componentIndex++;

				return `<${cTag} tabindex="-1" class="${className}${opts.$get('class')}"${opts.$attr('id')}>${html}</${cTag}>`;
			} catch(err) {
				indigo.logger.error(err);
				return '';
			}
		};

		/**
		 * @memberOf sourceloader
		 * @alias indigo.js#localsAssets
		 */
		app.locals.assets = function(req) {
			debug('Include assets: %s', JSON.stringify(req.model.assets));
			let lines = [],
				assets = [],
				uri = indigo.getComponentURL();
			for (let assetKey in req.model.assets) {
				const asset = req.model.assets[assetKey],
					lessFile = indigo.getNewURL(req, null, `/${req.session.locale}/components/${asset.className}/${asset.className}.less`, true),
					jsFile = indigo.getNewURL(req, null, `/${req.session.locale}/components/${asset.className}/${asset.className}.js`, true);
				if (lessFile !== true) {
					if (asset.wrapTag) {
						less.render(`${asset.wrapTag}.${asset.className} {\n${fs.readFileSync(getModuleWebDir(req) + lessFile, 'utf-8')}\n}`, 
						{
							syncImport : true, relativeUrls: false, compress: indigo.appconf.get('environment') !== 'dev', paths: ['web/default']
						}, (e, result) => {
							if(e) {
								indigo.logger.error(`LESS Parse Error: ${lessFile}\n`, JSON.stringify(e, null, 2));
							} else {
								lines.push(`<style>\n${result.css}\n</style>`);
							}
						});
					} else {
						assets.push(`<link rel="stylesheet" type="text/css" href="${uri}/${asset.className}.less">`);
					}
				}

				if (jsFile !== true) {
					if (asset.wrapTag) {
						const data = fs.readFileSync(getModuleWebDir(req) + jsFile, 'utf-8');
						lines.push(`<scripts>\n${jsRender(data, asset.wrapTag, asset.className)}\n</scripts>`);
					} else {
						assets.push(`<script src="${uri}/${asset.className}.js"></script>`);
					}
				}
			}
			return lines.concat(assets).join('\n');
		};

		/**
		 * @memberOf sourceloader
		 * @alias indigo.js#localsLocale
		 */
		app.locals.locale = function(req, localeKey) {
			let locales = indigo.getLocale(req),
				rest = [];
			localeKey.split('.').forEach((name) => {
				locales = locales[name];
			});
			for (let i = 2; i < arguments.length; i++) {
				rest.push(arguments[i]);
			}
			return indigo.substitute(locales, rest);
		};

		errorHandler.notFound(app);

		// Using the .html extension instead of
		// having to name the views as *.ejs
		app.engine('.html', ejs.__express);

		// Set the folder where the pages are kept
		app.set('views', webdir);

		/**
		 * Reference to HTTP server.
		 * @memberof indigo
		 * @alias logger
		 * @type {Object}
		 */
		indigo.http = http = require('http').createServer(app);

		const modules = appconf.get('modules');
		for (let index in modules) {
			try {
				require(modules[index]).init();
			} catch (e) {}
		}

		if (before) {
			before(http, app);
		}

		http.listen(indigo.portNumber, () => {
			logger.info('Server is running on port %s', indigo.portNumber);
			if (after) {
				after(http, app);
			}
		});
	},

	/**
	 * Register application routes
	 * @param {Object} appconf JSON object represents application configuration.
	 * @param {Object} [locales] Reference to <code>/lib/locales</code>.
	 * @param {Object} [reqModel] Reference to {@link libs/reqmodel} object what will be assign to <code>req.model</code> for each router request.
	 */
	addRoute(appconf, locales, reqModel) {
		routers.init(appconf, locales, reqModel);
	},

	/**
	 * Substitutes "{n}" tokens within the specified string with the respective arguments passed in.
	 * @param {String} str The string to make substitutions in. This string can contain special tokens of the form {n}, where n is a zero based index, that will be replaced with the additional parameters found at that index if specified.
	 * @param {String} rest — Additional parameters that can be substituted in the str parameter at each {n} location, where n is an integer (zero based) index value into the array of values specified.
	 */
	substitute(str, rest) {
		if (str) {
			rest.forEach((value, index) => {
				str = str.replace(new RegExp('\\{' + index + '\\}', 'g'), value);
			});
		}
		return str || '';
	},

	/**
	 * Explicitly closing http server by using unittests.
	 * @param {Function} done Callback function executing after services are terminated.
	 */
	close(done) {
		http.close(done);
	},

	/**
	 * Rendering HTML templates.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 * @param {String} fileName Name of HTML file under application web directory.
	 * @param {Object} [locales] Reference to the object with localization values.
	 */
	render(req, res, fileName, locales) {
		const next = () => {
			req.model.locales = locales || indigo.getLocale(req);
			req.model.req = req;

			if (fileName.indexOf('.') === -1) {
				fileName += '.html'; //attach default HTML extension
			}

			const newUrl = indigo.getNewURL(req, res, '/' + req.session.locale + fileName,  fileName);
			debug('render: %s -> %s', req.url, newUrl);

			fileName = getModuleWebDir(req) + newUrl;
			res.setHeader && res.setHeader('lang', req.model.locality.langugage);
			if (!fs.existsSync(fileName)) {
				res.status(404);
				res.setHeader && res.setHeader('path', fileName);
			}

			res.render(fileName, req.model, (err, result) => {
				if (err) {
					indigo.error(err, req, res);
				} else {
					res.send(result);
				}
			});
		};

		if (!req.model || !req.model.__initialized__) {
			req.model = reqModel(null, req, res, next);
		} else {
			next();
		}
	},

	/**
	 * Return path to the custom module.
	 * @param {String} key The property name/path defined in configuration file.
	 * @return {String} path Absolute path to the file from the current project directory.
	 */
	appconfPath(key) {
		const path = this.appconf.get(key);
		return path ? __appDir + path : null;
	},

	/**
	 * Return object with key/value pair when values will be localized base on client locale request.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {String} [keyName='locale'] Customize <code>req.params</code> key name refering to locale code.
	 * @return {Object} locale Collection of localization messages.
	 */
	getLocale(req, keyName) {
		req.params = req.params || {};
		return locales.init(req, req.params[keyName || 'locale']);
	},

	/**
	 * Return path to application webroot directory.
	 * @return {String} webdir Absolute path to webroot directory.
	 */
	getWebDir() {
		return webdir;
	},

	/**
	 * Return path to web/static directory defined in app.conf file.
	 * @return {String} Web path to static directory.
	 */
	getStaticDir() {
		return this.appconf.get('server:staticDir') || '/static';
	},

	/**
	 * Return base path to component assets.
	 * @return {String} Web path to component less and js files.
	 */
	getComponentURL() {
		return this.appconf.get('server:componentUri') || '/components';
	},

	/**
	 * Return HTML component tag.
	 * @return {String} HTML component tag.
	 */
	getComponentTag() {
		return this.appconf.get('server:componentTag') || 'c';
	},

	/**
	 * Return value from system environment or package.json
	 * @param {String} key Pair key.
	 * @return {String} Pair value.
	 */
	getEnv(key) {
		return process.env[key] || process.env['npm_package_config_' + key];
	},

	/**
	 * Return command line arguments
	 * @return {Object} Pair key and value.
	 */
	getArgs() {
		const args = {};
		for (let i in process.argv) {
			const pair = process.argv[i].split('=');
			if (pair.length === 2) {
				args[pair[0]] = pair[1];
			}
		}
		return args;
	},

	/**
	 * Verify path to existing file in application web directory based of locale rule in <code>libs/locales/accept-rules.json</code>.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 * @param {String} url Client request to the locale file. 
	 * @param {String} [redirectURL] Redirect URL in case <code>url</code> could not verify.
	 * @return {String} url New URL base on web appllication directory defined in locale dependencies.
	 */
	getNewURL(req, res, url, redirectURL) {
		const dir = getModuleWebDir(req);

		if (!req.session.locale) {
			indigo.getLocale(req);
		}

		if (!fs.existsSync(dir + url) && 
			url.indexOf('/' + req.session.locale +'/') !== -1) { //try to get file from another locale directory
			debug('getNewURL=%s locale=%s lookup=%s', url, req.session.locale, req.session.localeLookup);
			for (let index in req.session.localeLookup) {
				const newUrl = url.replace('/' + req.session.locale + '/', '/' + req.session.localeLookup[index] + '/');
				if (fs.existsSync(dir + newUrl)) {
					res && res.setHeader && res.setHeader('Referer', newUrl);
					return newUrl;
				}
			}
		}
		if (!fs.existsSync(dir + url)) {
			url = redirectURL || req.url || url;
		}
		return url;
	},

	/**
	 * Reference to debugging utility.
	 * @memberof indigo
	 * @alias debug
	 * @type {Function}
	 */
	debug: require('debug'),

	/**
	 * Import a module under <code>libs</code> directory.
	 * @param {String} module File name.
	 * @return {Object} module.
	 */
	libs(module) {
		return require('./libs/' + module);
	},

	/**
	 * Include Express directory handler.
	 * @param {String} path URI path.
	 * @param {String} webdir Absolute path to the web directory.
	 */
	static(path, webdir) {
		this.app.use(path, express.static(webdir));
	},

	/**
	 * Render an error template.
	 * @param {Object} err Contains information about errors.
	 * @param {express.Request} req Defines an object to provide client request information.
	 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
	 */
	error(err, req, res) {
		try {
			errorHandler.render(err, req, res, () => {
				res.status(400).json(null); //no errors
			});
		} catch (e) {
			indigo.logger.error(e);
		};
	}
};

/**
 * Return path of the current plugin/module webroot directory.
 * @param {express.Request} req Defines an object to provide client request information.
 * @return {String} webdir Absolute path to module webroot directory.
 */
function getModuleWebDir(req) {
	return req && req.moduleWebDir ? req.moduleWebDir() : indigo.getWebDir();
}

/**
 * Global variable defined absolute path to application directory.
 * @global
 * @alias __appDir
 * @type {String}
 */
global.__appDir = process.cwd();

/**
 * Global instance to the <code>indigo</code> module.
 * @global
 * @alias __indigo
 * @type {Object}
 */
/* istanbul ignore next */
if (!global.__indigo) {
	global.__indigo = indigo;
}

debug('__appDir: %s', __appDir);

/**
 * @module indigo
 * @see {@link indigo}
 *
 * @author David Gofman <dgofman@gmail.com>
 * @license MIT License {@link http://opensource.org/licenses/mit-license.php}
 */
module.exports = indigo;