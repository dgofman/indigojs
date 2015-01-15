'use strict';

var debug = require('debug')('indigo:errorHandler'),
	indigo, errorHandler = {};

module.exports = errorHandler = function(appconf) {

	indigo = require('../indigo');

	return function(err, req, res, next) {
		if (err) {

			var model = {
					code: res.statusCode
				},
				template = appconf.get('errors:template'),
				url = appconf.get('errors:' + res.statusCode);

			if (res.statusCode === 404) {
				model.message = 'Not Found';
				model.details = 'The requested URL was not found on this server: <code>' + req.url + '</code>';
			} else if (res.statusCode ===500) {
				model.message = 'Internal Server Error';
				model.details = 'The server encountered an unexpected condition.';
			} else if (res.statusCode ===503) {
				model.message = 'Service Unavailable';
				model.details = 'Connection refuse.';
			} else {
				model.message = 'System Error';
				model.details = 'Please contact your system administrator.';
			}

			debug(model);

			if (url && url.length > 0){
				res.redirect(url);
			} else {
				res.render(__appDir + (template || '/examples/templates/errors.html'), model);
			}
			return;
		}
		next(err);
	};
};

/*
	static function
*/
errorHandler.injectErrorHandler = function(err) {
	return errorHandler.error('ERROR_INJECT', err,
		'<h3>Internal error. Please contact your system administrator</h3><br/>Code: %UID%');
};

errorHandler.lessErrorHandler = function(err) {
	return errorHandler.error('ERROR_LESS_PARSING', err, 'Unable to parse file. Code: %UID%');
};

errorHandler.error = function(errorId, err, message) {
	var uid = new Date().getTime().toString();
	debug(err.toString());
	indigo.logger.error('%s: %s - ', errorId, uid, err.toString());
	return {
		id: errorId,
		uid: uid,
		error: err.toString(),
		message: message.replace('%UID%', uid)
	};
};