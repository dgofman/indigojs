'use strict';

/**
 * This module creating properties initializing on each router <code>express.Request</code> and assigning to <code>req.model</code>.
 * 
 * Based on <code>environment</code> value definded in <code>app.json</code> effecting includes at runtime
 * original source or compiled (<code>minify</code>) files by using keys <code>extCSS</code> and <code>extJS</code>.
 *
 * The object <code>locality</code> defined user locality information such as languge code.
 *
 * The <code>locales</code> object refering to the values of localization messages. This object builds based on 
 * your files names in your <code>locales</code> directory plus localization keys.
 *
 * The <code>routerBase</code> providing path for the current router.
 *
 * @version 1.0
 *
 * @module
 * @mixin libs/reqmodel
 *
 * @return {Object} model List of properties assigning to <code>req.model</code> for rendering in EJS templates.
 *
 * @see {@link libs/routers#init}
 * @see {@link libs/reqmodel.js}
 *
 * @example
 * conf/app.json 
 *{
 *	"environment": "dev"
 *	...
 *}
 *
 * @example
 * head.template.html 
 *
 * &lt;html lang="&lt;%= locality.langugage %&gt;"&gt;
 * &lt;meta charset="UTF-8"&gt;
 * &lt;meta http-equiv="content-type" content="text/html; charset=UTF-8"&gt;
 * &lt;title&gt;&lt;%= locales.content.pageTitle %&gt;&lt;/title&gt;
 *
 * &lt;link rel="stylesheet" href="css/bootstrap&lt;%= extCSS %&gt;" media="screen"&gt;
 * &lt;link rel="stylesheet" type="text/css" href="css/custom.less"&gt;
 *
 * &lt;script src="js/vendor/require-2.1.15&lt;%= extJS %&gt;" data-main="js&lt;%= routerBase %&gt;/main-&lt;%= environment %&gt;"&gt;&lt;/script&gt;
 */
function reqmodel(appconf) {

	var env = appconf.get('environment'),
		minify = env === 'dev' ? '' : '.min';

	return {
		environment: env,
		minify: minify,
		extCSS: minify + '.css',
		extJS: minify + '.js',
		locality: {},
		locales: {},
		routerBase: null
	};
}

/**
 * @module reqmodel
 * @see {@link libs/reqmodel}
 */
module.exports = reqmodel;