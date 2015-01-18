'use strict';

var expressSession = require('express-session');

/**
 * Default module for the initialization of <code>req.session</code> request attribute. 
 * For initialization of custom session module locate the path to the new library.
 * For security reason recommending update the default <code>session-key</code> value.
 *
 * @example
 * conf/app.json 
 *{
 *
 *	"server": {
 *		...
 *		"session": {
 *			"session-key": "indigojs-session",
 *			"path": null
 *		}
 *		...
 *	}
 *}
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/session
 *
 * @param {Object} appconf An application configuration.
 * @return {express.Session} Instance to the <code>express:Session</code> module.
 * 
 * @see {@link libs/session.js}
 * @see {@link https://www.npmjs.com/package/express-sessions}
 *
 * @requires express-session
 */
function session(appconf) {
	var opts = {
		secret: appconf.get('server:session:session-key') || 'key_' + new Date().getTime(),
		resave: true,
		saveUninitialized: true
	};
	return expressSession(opts);
}

/**
 * @module session
 * @see {@link libs/session}
 */
module.exports = session;