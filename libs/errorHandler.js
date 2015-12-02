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
var errorHandler = {};

errorHandler.render = function(err, req, res, next) {
	if (err) {
		var appconf = indigo.appconf,
			model = req.model || {},
			code = err.statusCode || res.statusCode,
			template = appconf.get('errors:template'),
			url = appconf.get('errors:' + code);

		model.code = code;
		model.errorCode = err.errorCode;

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

		if (!req.headers || req.headers['error_verbose'] !== 'false') {
			errorHandler.error(model.errorCode, err, err.errorMessage || model.message, req.url);
		}

		if (url && url.length > 0){
			res.redirect(url);
		} else {
			res.status(model.code).render(__appDir + (template || '/node_modules/indigojs/examples/templates/errors.html'), model);
		}
		return;
	}
	next();
};

/**
 * Error handler of runtime errors during rendering EJS templates.
 * @see {@link sourceloader.indigo.js#localsInject app.locals.inject}
 * @memberof libs/errorHandler.prototype
 * @alias injectErrorHandler
 * @param {Object} err Contains information about errors.
 * @return {Object} error JSON object with error infomation.
 */
errorHandler.injectErrorHandler = function(err) {
	return errorHandler.error('ERROR_INJECT', err,
		'<h3>Internal error. Please contact your system administrator</h3><br/>Code: %UID%');
};

/**
 * Logging an error message and assigning an uinque system id for each error.
 * @memberof libs/errorHandler.prototype
 * @alias error
 * @param {String} errorId Error id assigning for each function hanlder.
 * @param {Object} err Contains information about errors.
 * @param {String} message Error description.
 * @param {String} [details] Error details.
 * @return {Object} error JSON object with error infomation.
 */
errorHandler.error = function(errorId, err, message, details) {
	var error = err instanceof Error ? err : JSON.stringify(err || ''),
		err_stack = error.stack || error.toString(),
		uid = isNaN(errorId) ? Date.now() : errorId;
	message = (message || '').replace('%UID%', uid);
	indigo.logger.error(message + ',  uid=' + uid + ' - ' + (details || '') + ' [' + err_stack + ']' );
	return {
		id: errorId,
		uid: uid,
		error: err_stack,
		message: message
	};
};

/**
 * Utility for output error JSON response on the client REST request.
 * @memberof libs/errorHandler.prototype
 * @alias json
 * @param {express.Request} req Defines an object to provide client request information.
 * @param {express.Response} res Defines an object to assist a server in sending a response to the client.
 * @param {String} [errorKey] Error code id defined in <code>error.json</code> under locales directory.
 * @param {Number} [errorCode=400] HTTP error code.
 */
errorHandler.json = function(req, res, errorKey, errorCode) {
	var locales = indigo.getLocale(req);
	res.status(errorCode || 400).json( { error: locales.errors ? locales.errors[errorKey] : errorKey } );
};

/**
 * @module errorHandler
 * @see {@link libs/errorHandler}
 */
module.exports = errorHandler;