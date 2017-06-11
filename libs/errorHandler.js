'use strict';

const indigo = global.__indigo;

/**
 * The default exception handler module. It is assigned to each router and reports errors 
 * that occurred during an HTTP request.
 *
 * indigo provides the option to override this library from <code>app.json</code> by specifing the <code>path</code>
 * to your custom library.
 *
 * Indigo renders templates from the <code>examples/templates</code> directory, however it is possible to customize HTML error details by pointing to your own <code>template</code> file. 
 *
 * A specific URL link can also be specified for HTTP errors <code>400/500/503</code>.
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
 */
const errorHandler = () => {

	let instance;

	return instance = {
		render(err, req, res, next) {
			if (err) {
				try {
					indigo.logger.error(JSON.stringify(err, null, 2));
				} catch (e) {
					indigo.logger.error(e);
				}

				if (req) {

					indigo.reqModel(req, res, () => {});

					if (!req.model.errorModel) {
						let self = this || instance;
						req.model.errorModel = self.getErrorModel(err, req, res),
						self.setErrorDetails(req.model.errorModel, err.errorCode, err, err.errorMessage);

						if (!req.headers || req.headers['error_verbose'] !== 'false') {
							indigo.logger.error(req.model.errorModel);
						}
					}

					const appconf = indigo.appconf,
						template = appconf.get('errors:template'),
						url = appconf.get('errors:' + req.model.errorModel.statusCode);
					if (!res._headerSent) {
						if (url && url.length > 0){
							res.redirect(url);
						} else {
							res.status(req.model.errorModel.statusCode).render(__appDir + (template || '/node_modules/indigojs/examples/templates/errors.html'), req.model);
						}
					} else {
						next();
					}
					return req.model;
				}
			}
			next();
		},

		/**
		 * Creates an error model based on statusCode.
		 * @memberof libs/errorHandler.prototype
		 * @alias getErrorModel
		 * @param {Object} err Contains information about errors.
		 * @param {express.Request} req Defines an object to provide client request information.
		 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
		 */
		getErrorModel(err, req, res) {
			const model = req.model.errorModel = {};

			model.statusCode = err.statusCode || res.statusCode;
			model.date = new Date();
			model.uid = model.date.getTime();
			model.url = req.originalUrl || req.url;

			if (model.statusCode === 404) {
				model.message = 'Not Found';
				model.details = 'The requested URL was not found on this server: <code>' + req.url + '</code>';
			} else if (model.statusCode === 500) {
				model.message = 'Internal Server Error';
				model.details = 'The server encountered an unexpected condition.';
			} else if (model.statusCode === 503) {
				model.message = 'Service Unavailable';
				model.details = 'Connection refuse.';
			} else {
				model.message = 'IDGJS_ERROR_' + model.statusCode;
				model.details = 'Please contact your system administrator.';
			}

			return model;
		},

		/**
		 * Updates the error model.
		 * @memberof libs/errorHandler.prototype
		 * @alias updateErrorModel
		 * @param {Object} model Error model.
		 * @param {String|Number} errorId Error id assigned for each individual function handler.
		 * @param {Object} err Contains information about errors.
		 * @param {String} message Error description.
		 * @param {String} [details] Error details.
		 * @return {Object} error JSON object with error information.
		 */
		setErrorDetails(model, errorId, err, message, details) {
			model.uid = model.uid || Date.now();
			model.errorId = errorId;
			
			model.error = err instanceof Error ? err : JSON.stringify(err || '');
			model.log_msg = (message || model.message || '').replace('%UID%', model.uid) + ',  uid=' + model.uid + ' - ' + 
				(details || model.details || '') + ' [' + (model.error.stack || model.error.toString()) + ']';
			return model;
		},

		/**
		   Handles runtime errors during EJS template rendering.
		 * @see {@link sourceloader.indigo.js#localsInject app.locals.inject}
		 * @memberof libs/errorHandler.prototype
		 * @alias injectErrorHandler
		 * @param {Object} err Contains information about errors.
		 * @param {express.Request} req Defines an object to provide client request information.
		 * @param {String} url Load URL.
		 * @return {Object} error JSON object with error infomation.
		 */
		injectErrorHandler(err, req, url) {
			return this.error('ERROR_INJECT', err,
				'<h3>Internal error. Please contact your system administrator</h3><br/>Code: %UID%', url);
		},

		/**
		 * Logs an error message and assigns a unique system id to each error.
		 * @memberof libs/errorHandler.prototype
		 * @alias error
		 * @param {String|Number} errorId Error id assigned to individual function hanlder.
		 * @param {Object} err Contains information about errors.
		 * @param {String} message Error description.
		 * @param {String} [details] Error details.
		 * @return {Object} error JSON object with error information.
		 */
		error(errorId, err, message, details) {
			const model = this.setErrorDetails({}, errorId, err, message, details);
			indigo.logger.error(model);
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
		json(req, res, errorKey, errorCode) {
			const locales = indigo.getLocale(req);
			res.status(errorCode || 400).json( { error: locales.errors ? locales.errors[errorKey] : errorKey } );
		},

		/**
		 * Handle 404 Error.
		 * @memberof libs/errorHandler.prototype
		 * @alias notFound
		 */
		notFound(app) {
			app.use((req, res, next) => {
				if (!req.headers.referer) {
					indigo.reqModel(req, res, () => {
						this.render({statusCode: 404}, req, res, next);
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