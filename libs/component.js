'use strict';

const indigo = global.__indigo,
	debug = require('debug')('indigo:component'),
	ejs = require('ejs'),
	fs = require('fs'),
	less = require('less'),
	componentTag = indigo.appconf.get('server:componentTag') || false,
	addTitle = function(req, title) {
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
		return `window.top.init(window, '${componentTag ? wrapTag : ''}[cid=${className}]', ${data});`;
	};

/**
 * @module component
 * @see {@link libs/component}
 */
module.exports = function(app) {

	var getModuleWebDir = indigo.getModuleWebDir;

	app.get(`${indigo.getComponentURL()}/:file`, (req, res) => {
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
					less.render(`${componentTag ? indigo.getComponentTag() : ''}[cid=${className}] {\n${data.toString()}\n}`, {
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
	 * @alias component.js#component
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

			return `<${cTag} cid="${className}"${opts.$attr('class')}${opts.$attr('id')} tabindex="-1">${html}</${cTag}>`;
		} catch(err) {
			indigo.logger.error(err);
			return '';
		}
	};

	/**
	 * @memberOf sourceloader
	 * @alias component.js#finalize
	 */
	app.locals.finalize = function(req) {
		debug('Include scripts: %s', JSON.stringify(req.model.assets));
		let lines = [],
			assets = [`<link rel="stylesheet" type="text/css" href="${req.model.baseStaticPath}/css/common${req.model.extLESS}">`],
			uri = indigo.getComponentURL();
		for (let assetKey in req.model.assets) {
			const asset = req.model.assets[assetKey],
				lessFile = indigo.getNewURL(req, null, `/${req.session.locale}/components/${asset.className}/${asset.className}.less`, true),
				jsFile = indigo.getNewURL(req, null, `/${req.session.locale}/components/${asset.className}/${asset.className}.js`, true);
			if (lessFile !== true) {
				assets.push(`<link rel="stylesheet" type="text/css" href="${uri}/${asset.className}.less">`);
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
		for (let i = 1; i < arguments.length; i++) {
			assets.push(`<script src="${arguments[i]}"></script>`);
		}
		return lines.concat(assets).join('\n');
	};
}