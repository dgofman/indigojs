'use strict';

const indigo = global.__indigo,
	fs = require('fs');

/**
 * This module creates properties initializing on each router <code>express.Request</code> and assigning to <code>req.model</code>.
 * 
 * Based on <code>environment</code> value definded in <code>app.json</code> is included at runtime
 * original source or compiled (<code>minify</code>) files by using keys <code>extCSS</code> and <code>extJS</code>.
 *
 * The <code>locales</code> object refers to the values of localization messages.
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
 * @example
 *
 *<pre><code>conf/app.json 
 *{
 *	"environment": "dev"
 *	...
 *}
 *</code></pre>
 *
 *
 *<pre><code>head.template.html 
 *
 * &lt;link rel="stylesheet" href="css/bootstrap&lt;%- <b>extCSS</b> %&gt;" media="screen"/&gt;
 *
 *&lt;script src="js/vendor/require-2.1.15&lt;%- <b>extJS</b> %&gt;" data-main="js&lt;%- contextPath %&gt;/main-&lt;%- environment %&gt;"/&gt;
 *</code></pre>
 *
 * You can override this module anytime
 *
 *<pre><code> module.exports = function(appconf, app) {
 *	const reqmodel = indigo.libs('reqmodel')(appconf, app); //initializes default indigoJS properties
 *
 *	return function(req, res, next) {
 *		reqmodel(req, res, function() {
 *			 //adds custom properties
 *			req.model.customKey = 'customValue';
 *			...
 *			next();
 *		});
 *	};
 * };
 *</code></pre>
 */

const reqmodel = (appconf, app) => {

	let env = appconf.get('environment');

	if ((process.env.NODE_ENV || '').trim() === 'production') {
		env = 'prod';
	}

	const minify = env === 'dev' ? '' : '.min',
		extLESS = env === 'dev' ? '.less' : '.css',
		staticDir = indigo.getStaticDir();

	return (req, res, next) => {
		req.model = req.model || {
			req: req,
			environment: env,
			minify: minify,
			extCSS: `${minify}.css`,
			extJS: `${minify}.js`,
			extLESS: extLESS,
			contextPath: req.baseUrl,
			baseStaticPath: staticDir,
			componentPath: indigo.getComponentPath(),

			$createTemplate: (...urls) => {
				const lines = [];
				urls.forEach(function(url) {
					lines.push(`<script type="text/igo-template" path="${url}">\n${app.locals.inject(req, url)}\n</script>`);
				});
				lines.push(`<script type="text/igo-template" path="components">${app.locals.finalize.apply(null, [req])}\n</script>`);
				return lines.join('\n');
			},
			$sharedTemplate: (url, selector) => {
				return `<script>window.top.sharedTemplate(${JSON.stringify(url)}, '${selector || "body"}', window)</script>`;
			},
			$sharedStyle: (...urls) => {
				return `<script>window.top.sharedStyle(${JSON.stringify(urls)}, window)</script>`;
			},
			$include: (url) => {
				return app.locals.inject(req, url);
			},
			$localeMap: function(map) {
				return `<script>\nvar indigoLocales = ${JSON.stringify(map, null, 2)}\n</script>`;
			},
			$locales: (...args) => {
				args.unshift(req);
				return app.locals.locale.apply(null, args);
			},
			$finalize: (...args) => {
				args.unshift(req);
				return app.locals.finalize.apply(null, args);
			},
			$: (className, opts, wrapTag) => {
				return app.locals.component(req, className, opts, wrapTag);
			},
			$link: (path, isFolder=false, basePath=staticDir) => {
				if (isFolder && env === 'dev') {
					const lessFiles = [],
						dir = path.split('/').pop(),
						files = fs.readdirSync(`${indigo.getModuleWebDir(req)}/default/less/${dir}`);

					files.forEach(file => {
						lessFiles.push(`<link rel="stylesheet" type="text/css" href="${basePath}${path}/${file}">`);
					});
					if (lessFiles.length) {
						return lessFiles.join('\n');
					}
				}
				return `<link rel="stylesheet" type="text/css" href="${basePath}${path}${extLESS}">`;
			},
			__initialized__: Date.now()
		};

		indigo.locales.headerLocale(req);

		next();
	};
};

/**
 * @module reqmodel
 * @see {@link libs/reqmodel}
 */
module.exports = reqmodel;