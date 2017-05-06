'use strict';

const indigo = global.__indigo,
	debug = require('debug')('indigo:component'),
	ejs = require('ejs'),
	fs = require('fs'),
	less = require('less'),
	componentTag = indigo.appconf.get('server:componentTag') || false,
	/** Do not change function to ES6 arrow (using scope this) */
	addTitle = function(req, title) {
		title = title || this.title;
		return ` tabindex="${req.model.componentIndex}"` + (title ? ' title="' + title + '"' : '');
	},
	addLabel = function(req, title) {
		title = title || this.title;
		return ` tabindex="${req.model.componentIndex}"` + (title ? ' aria-label="' + title + '"' : '');
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
	}, getAttrs = function(name) {
		let attrs = [],
			obj = this[name];
		for (var key in obj) {
			attrs.push(`${key}="${obj[key]}"`);
		}
		return attrs.length ? ` ${attrs.join(' ')}` : '';
	}, getCss = function(name, tagName) {
		if (this[name] !== undefined) {
			if (tagName === undefined) {
				return ` ${name}: ${this[name]};`;
			} else {
				return ` ${tagName}: ${this[name]};`;
			}
		}
		return '';
	}, jsRender = (data, wrapTag, className) => {
		return `window.top.init(window, '${componentTag ? wrapTag : ''}[cid=${className}]', ${data});`;
	};

/**
 * @module component
 * @see {@link libs/component}
 */
module.exports = (app) => {

	var getModuleWebDir = indigo.getModuleWebDir;

	app.get(`${indigo.getComponentPath()}/:file`, (req, res) => {
		req.model = req.model || {};
		indigo.locales.headerLocale(req);

		const arr = req.params.file.split('.'),
			dir = getModuleWebDir(req),
			className = arr[0],
			cache = parseInt(indigo.appconf.get('server:cache')),
			fileURL = indigo.getNewURL(req, null, `/components/${className}/${req.params.file}`);
		if (!fs.existsSync(dir + fileURL)) {
			return res.status(404).end();
		}

		fs.readFile(dir + fileURL, (error, data) => {
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
						paths: [getModuleWebDir(req) + '/default']
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
	app.locals.component = app.locals.$ = (req, className, opts={}, wrapTag=null) => {
		const cTag = wrapTag || indigo.getComponentTag();
		debug(req.method, className);
		const dir = getModuleWebDir(req),
			newUrl = indigo.getNewURL(req, null, `/components/${className}/${className}.html`);

		try {
			opts.$get = getProps;
			opts.$attr = getAttr;
			opts.$attrs = getAttrs;
			opts.$css = getCss;
			opts.$title = addTitle;
			opts.$label = addLabel;
			req.model.opts = opts;
			req.model.componentIndex = req.model.componentIndex || 1;
			req.model.assets = req.model.assets || {};
			let html = '';

			if (fs.existsSync(dir + newUrl)) {
				req.model.filename = getModuleWebDir(req) + newUrl;
				html = ejs.render(fs.readFileSync(req.model.filename, 'utf-8'), req.model);
			}

			if (!req.model.assets[className]) {
				req.model.assets[className] = {className, wrapTag};
			}
			req.model.componentIndex++;

			if (opts.show === false) {
				opts.parentStyle = ('display: none; ' + (opts.parentStyle || '')).trim();
			}

			opts.class = opts.class ? `${opts.class} init` : 'init';

			return `<${cTag} cid="${className}" class="${opts.class}"${opts.$get('disabled', 'disabled')}${opts.$attr('parentStyle', 'style')}${opts.$attr('id')} tabindex="-1">${html}</${cTag}>`;
		} catch(err) {
			indigo.logger.error(err);
			return '';
		}
	};

	/**
	 * @memberOf sourceloader
	 * @alias component.js#finalize
	 */
	app.locals.finalize = (req, ...args) => {
		debug('Include scripts: %s', JSON.stringify(req.model.assets));
		let lines = [],
			assets = [],
			uri = indigo.getComponentPath();
		if (args.length && args[0] === true) { //include common.less
			assets.push(`<link rel="stylesheet" type="text/css" href="${req.model.baseStaticPath}/css/common${req.model.extLESS}">`);
		}
		for (let className in req.model.assets) {
			const asset = req.model.assets[className],
				dir = getModuleWebDir(req),
				lessFile = indigo.getNewURL(req, null, `/components/${asset.className}/${asset.className}.less`),
				jsFile = indigo.getNewURL(req, null, `/components/${asset.className}/${asset.className}.js`);
			if (fs.existsSync(dir + lessFile)) {
				assets.push(`<link href="${uri}/${asset.className}.less" rel="stylesheet" type="text/css"/>`);
			}

			if (fs.existsSync(dir + jsFile)) {
				assets.push(`<script src="${uri}/${asset.className}.js" type="text/javascript"></script>`);
			}
		}
		for (let i = 0; i < args.length; i++) {
			if (typeof args[i] === 'string') {
				assets.push(`<script src="${args[i]}"></script>`);
			}
		}
		return lines.concat(assets).join('\n');
	};
};