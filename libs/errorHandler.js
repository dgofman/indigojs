'use strict';

var debug = require('debug')('indigo:errorHandler'),
	errorHandler = {};

module.exports = errorHandler = function(appconf) {

	return function(err, req, res, next) {
		if (err) {

			var model = {
					code: res.statusCode,
					message: '',
					details: ''
				},
				template = appconf.get('errors:template'),
				file = appconf.get('errors:' + res.statusCode);

			if (res.statusCode === 404) {
				model.message = 'Not Found';
				model.details = 'The requested URL was not found on this server: <code>' + req.url + '</code>';
			} else if (res.statusCode ===500) {
				model.message = 'Internal Server Error';
				model.details = 'The server encountered an unexpected condition.';
			} else if (res.statusCode ===503) {
				model.message = 'Service Unavailable';
				model.details = 'Connection refuse.';
			}

			debug(model);

			if (file && file.length > 0){
				res.redirect(file);
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
	debug(err.toString());
	var code = new Date().getTime();
	return {
		code: code,
		error: err.toString(),
		message: '<h3>Internal error. Please contact your system administrator</h3><br/>Code: ' + code
	};
};