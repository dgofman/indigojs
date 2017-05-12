'use strict';

const indigo = global.__indigo,
	debug = require('debug')('indigo:component'),
	ejs = require('ejs'),
	fs = require('fs'),
	less = require('less'),
	componentTag = indigo.appconf.get('server:componentTag') || false,
	assign = (req, opts, self) => {
		self = self || opts;
		const register = (handler) => {
			return function(...rest) {
				rest.unshift(opts);
				rest.unshift(req);
				return handler.apply(self, rest);
			};
		};
		self.$get = register(getProps);
		self.$attr = register(getAttr);
		self.$attrs = register(getAttrs);
		self.$css = register(getCss);
		self.$title = register(addTitle);
		self.$label = register(addLabel);
		self.$assign = assign;
		return self;
	}, addTitle = (req, opts, title) => {
		title = title || opts.title;
		return ` tabindex="${req.model.componentIndex}"` + (title ? ' title="' + title + '"' : '');
	}, addLabel = (req, opts, title) => {
		title = title || opts.title;
		return ` tabindex="${req.model.componentIndex}"` + (title ? ' aria-label="' + title + '"' : '');
	}, getProps = (req, opts, name, val) => {
		if (opts[name] !== undefined) {
			if (val === undefined) {
				return ` ${opts[name]}`;
			} else {
				return ` ${val}`;
			}
		}
		return '';
	}, getAttr = (req, opts, name, tagName) => {
		if (opts[name] !== undefined) {
			if (tagName === undefined) {
				return ` ${name}="${opts[name]}"`;
			} else {
				return ` ${tagName}="${opts[name]}"`;
			}
		}
		return '';
	}, getAttrs = (req, opts, name) => {
		let attrs = [],
			obj = opts[name];
		for (var key in obj) {
			attrs.push(`${key}="${obj[key]}"`);
		}
		return attrs.length ? ` ${attrs.join(' ')}` : '';
	}, getCss = (req, opts, name, tagName) => {
		if (opts[name] !== undefined) {
			if (tagName === undefined) {
				return ` ${name}: ${opts[name]};`;
			} else {
				return ` ${tagName}: ${opts[name]};`;
			}
		}
		return '';
	}, jsRender = (data, cTag, className) => {
		return `window.top.init(window, '${componentTag ? cTag : ''}[cid=${className}]', ${data});`;
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

				if (arr[1] === 'js') {
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
	app.locals.component = app.locals.$ = (req, className, opts={}) => {
		const cTag = indigo.getComponentTag();
		debug(req.method, className);
		const dir = getModuleWebDir(req),
			newUrl = indigo.getNewURL(req, null, `/components/${className}/${className}.html`);

		try {
			let model = assign(req, opts, req.model);
			model.opts = opts;
			model.componentIndex = model.componentIndex || 1;
			model.assets = model.assets || {};

			if (!model.assets[className]) {
				model.assets[className] = {className, cTag};
			}
			model.componentIndex++;

			let html = '', 
				begin = `<${cTag} cid="${className}" tabindex="-1" class="init${model.$get('class')}"${model.$get('disabled', 'disabled')}${model.$attr('id')}`;
			if (fs.existsSync(dir + newUrl)) {
				model.filename = getModuleWebDir(req) + newUrl;
				html = ejs.render(fs.readFileSync(model.filename, 'utf-8'), req.model);
			}

			if (opts.show === false) {
				opts.parentStyle = `display: none; ${opts.parentStyle || ''}`;
			}
			html = `${begin}${model.$attr('parentStyle', 'style')}>${html}</${cTag}>`;

			return html;
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
				assets.push(`<script src="${uri}/${asset.className}.js" rel="${className}" type="text/javascript"></script>`);
			} else {
				assets.push(`<script>window.top.init(window, '[cid=${className}]', function() {})</script>`);
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