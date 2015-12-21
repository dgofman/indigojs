'use strict';

var indigo = global.__indigo;

/**
 * This is the default expection handler module assigned for each router and reporting an error 
 * that occurred during HTTP request.
 *
 * indigo provides the option to override this library from <code>app.json</code> by specifing <code>path</code>
 * to your custom library.
 *
 * Another option for you is to customize an HTML error details by pointing to your <code>template</code> file. By default
 * indigo rendering template from <code>examples/templates</code> directory. 
 *
 * And last option is the ability to specify a URL link for HTTP errors <code>400/500/503</code>.
 * 
 * @see {@link sourceloader.routers.js#errorHandler libs/routers}
 *
 * @example
 * conf/app.json 
 *{
 *	...
 *	"errors": {
 *		"path": null,
 *		"template": null,
 *		"404": "",
 *		"500": "",
 *		"503": ""
 *	}
 *	...
 *}
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/errorHandler
 * @param {Object} appconf An application configuration.
 */
var errorHandler = function() {

	return {
		render: function(err, req, res, next) {
			if (err && req) {
				req.model = req.model || {};

				var model = req.model.errorModel;
				if (!model) {
					req.model.errorModel = model = this.getErrorModel(err, req, res),
					this.setErrorDetails(model, err.errorCode, err, err.errorMessage);
				}

				var appconf = indigo.appconf,
					template = appconf.get('errors:template'),
					url = appconf.get('errors:' + model.code);

				if (!req.headers || req.headers['error_verbose'] !== 'false') {
					indigo.logger.error(model.log_msg);
				}

				if (url && url.length > 0){
					res.redirect(url);
				} else {
					res.status(model.code).render(__appDir + (template || '/node_modules/indigojs/examples/templates/errors.html'), req.model);
				}
				return model;
			}
			next();
		},

		/**
		 * Create an error model based on statusCode.
		 * @memberof libs/errorHandler.prototype
		 * @alias getErrorModel
		 * @param {Object} err Contains information about errors.
		 * @param {express.Request} req Defines an object to provide client request information.
		 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
		 */
		getErrorModel: function(err, req, res) {
			var model = req.model.error = {},
				code = err.statusCode || res.statusCode;

			model.code = code;
			model.date = new Date();
			model.uid = model.date.getTime();
			model.url = req.originalUrl || req.url;

			if (model.code === 404) {
				model.message = 'Not Found';
				model.details = 'The requested URL was not found on this server: <code>' + req.url + '</code>';
			} else if (model.code === 500) {
				model.message = 'Internal Server Error';
				model.details = 'The server encountered an unexpected condition.';
			} else if (model.code === 503) {
				model.message = 'Service Unavailable';
				model.details = 'Connection refuse.';
			} else {
				model.message = 'IDGJS_ERROR_' + model.code;
				model.details = 'Please contact your system administrator.';
			}

			return model;
		},

		/**
		 * Update error model.
		 * @memberof libs/errorHandler.prototype
		 * @alias updateErrorModel
		 * @param {Object} model Error model.
		 * @param {String|Number} errorId Error id assigning for each function hanlder.
		 * @param {Object} err Contains information about errors.
		 * @param {String} message Error description.
		 * @param {String} [details] Error details.
		 * @return {Object} error JSON object with error infomation.
		 */
		setErrorDetails: function(model, errorId, err, message, details) {
			model.uid = model.uid || Date.now();
			model.errorId = errorId;
			
			model.error = err instanceof Error ? err : JSON.stringify(err || '');
			model.log_msg = (message || model.message || '').replace('%UID%', model.uid) + ',  uid=' + model.uid + ' - ' + 
				(details || model.details || '') + ' [' + (model.error.stack || model.error.toString()) + ']';
			return model;
		},

		/**
		 * Error handler of runtime errors during rendering EJS templates.
		 * @see {@link sourceloader.indigo.js#localsInject app.locals.inject}
		 * @memberof libs/errorHandler.prototype
		 * @alias injectErrorHandler
		 * @param {Object} err Contains information about errors.
		 * @param {express.Request} req Defines an object to provide client request information.
		 * @param {String} url Load URL.
		 * @return {Object} error JSON object with error infomation.
		 */
		injectErrorHandler: function(err, req, url) {
			return this.error('ERROR_INJECT', err,
				'<h3>Internal error. Please contact your system administrator</h3><br/>Code: %UID%', url);
		},

		/**
		 * Logging an error message and assigning an uinque system id for each error.
		 * @memberof libs/errorHandler.prototype
		 * @alias error
		 * @param {String|Number} errorId Error id assigning for each function hanlder.
		 * @param {Object} err Contains information about errors.
		 * @param {String} message Error description.
		 * @param {String} [details] Error details.
		 * @return {Object} error JSON object with error infomation.
		 */
		error: function(errorId, err, message, details) {
			var model = this.setErrorDetails({}, errorId, err, message, details);
			indigo.logger.error(model.log_msg);
			return model;
		},

		/**
		 * Utility for output error JSON response on the client REST request.
		 * @memberof libs/errorHandler.prototype
		 * @alias json
		 * @param {express.Request} req Defines an object to provide client request information.
		 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
		 * @param {String} [errorKey] Error code id defined in <code>error.json</code> under locales directory.
		 * @param {Number} [errorCode=400] HTTP error code.
		 */
		json: function(req, res, errorKey, errorCode) {
			var locales = indigo.getLocale(req);
			res.status(errorCode || 400).json( { error: locales.errors ? locales.errors[errorKey] : errorKey } );
		},

		/**
		 * Handle 404 Error.
		 * @memberof libs/errorHandler.prototype
		 * @alias notFound
		 */
		notFound: function(app) {
			var self = this;
			app.use(function(req, res, next) {
				if (!req.headers.referer) {
					indigo.reqModel(null, req, res, function() {
						self.render({statusCode: 404}, req, res, next);
					});
				} else {
					next();
				}
			});
		}
	};
};

/**
 * @module errorHandler
 * @see {@link libs/errorHandler}
 */
module.exports = errorHandler;