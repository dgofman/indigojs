'use strict';

/**
 * This module creates properties initializing on each router <code>express.Request</code> and assigning to <code>req.model</code>.
 * 
 * Based on <code>environment</code> value definded in <code>app.json</code> is included at runtime
 * original source or compiled (<code>minify</code>) files by using keys <code>extCSS</code> and <code>extJS</code>.
 *
 * The object <code>locality</code> defined user locality information such as language code.
 *
 * The <code>locales</code> object refers to the values of localization messages. This object builds based on 
 * your files names in your <code>locales</code> directory plus localization keys.
 *
 * The <code>contextPath</code> providing path for the current router.
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
 * &lt;script src="js/vendor/require-2.1.15&lt;%= extJS %&gt;" data-main="js&lt;%= contextPath %&gt;/main-&lt;%= environment %&gt;"&gt;&lt;/script&gt;
 *
 * You can override this module anytime
 *
 * module.exports = function(appconf) {
 *	var reqmodel = indigo.libs('reqmodel')(appconf);
 *
 *	return function(contextPath, req, res, next) {
 *		reqmodel(contextPath, req, res, function() {
 *			req.model.newModelKey = 'newModelValue';
 *			next();
 *		});
 *	};
 * };
 */

function reqmodel(appconf) {

	let minify, env = appconf.get('environment'),
		staticDir =  global.__indigo.getStaticDir();

	if ((process.env.NODE_ENV || '').trim() === 'production') {
		env = 'prod';
	}

	env = env || 'dev';
	minify = env === 'dev' ? '' : '.min';

	return (contextPath, req, res, next) => {
		req.model = req.model || {
			req: req,
			environment: env,
			minify: minify,
			extCSS: `${minify}.css`,
			extJS: `${minify}.js`,
			extLESS: env === 'dev' ? '.less' : '.css',
			locality: {},
			locales: {},
			contextPath: contextPath || req.baseUrl,
			baseStaticPath: staticDir,

			app_template: `${appconf.app_template}`,
			$include: (url) => {
				return app.locals.inject(req, url);
			},
			$locale: (localeKey) => {
				var args = [req, localeKey];
				for (let i = 1; i < arguments.length; i++) {
					args.push(arguments[i]);
				}
				return app.locals.locale.apply(null, args);
			},
			$finalize: () => {
				return app.locals.finalize(req);
			},
			$: (className, opts, wrapTag) => {
				return app.locals.component(req, className, opts, wrapTag);
			},

			__initialized__: Date.now()
		};

		next();
	};
}

/**
 * @module reqmodel
 * @see {@link libs/reqmodel}
 */
module.exports = reqmodel;