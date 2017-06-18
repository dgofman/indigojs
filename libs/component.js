'use strict';

const indigo = global.__indigo,
	debug = require('debug')('indigo:component'),
	ejs = require('ejs'),
	fs = require('fs'),
	less = require('less'),
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
		self.$assign = (opts, self) => {
			return assign(req, opts, self);
		};
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
	};

/**
 * @module component
 * @see {@link libs/component}
 */
module.exports = (app) => {


	app.get(`${indigo.getComponentPath()}/*`, (req, res, next) => {

		let file = req.params[0],
			compDir = `${indigo.getModuleWebDir(req)}/default/components`;

		if (file.startsWith('static')) {
			compDir = `${indigo.getBuildPath()}/components`;
		}

		const ext = file.split('.').pop(),
			filePath = `${compDir}/${file}`;

		if (ext === 'less') {
			return module.exports.renderLess(filePath, req, res, next);
		}

		fs.readFile(filePath, function(err, data) {
			if (err) {
				indigo.logger.error(err);
				res.status(404).end();
			} else {
				res.contentType(ext);
				res.send(data);
			}
		});
	});

	/**
	 * @memberOf sourceloader
	 * @alias component.js#component
	 */	
	app.locals.component = app.locals.$ = (req, className, opts={}) => {
		debug(req.method, className);

		if (className.charCodeAt(0) < 91) {
			className = 'igo' + className; //Button -> igoButton 
		}

		const cTag = indigo.getComponentTag(),
			dir = indigo.getModuleWebDir(req),
			match = className.match(/(.*)([A-Z].*)/);

		if (match && match.length === 3) {
			try {
				const pkg = match[1],
					type = match[2].toLowerCase(),
					newUrl = indigo.getNewURL(req, null, `/default/components/${pkg}/${type}/${type}.ejs`),
					model = assign(req, opts, req.model);
				model.opts = opts;
				model.assets = model.assets || {};
				model.componentIndex = model.componentIndex || 1;

				if (!model.assets[className]) {
					model.assets[className] = {pkg, type};
				}

				let html = '',
					begin = `<${cTag} _=${className} tabindex="-1" class="init${model.$get('class')}"${opts.disabled ? model.$get('disabled', 'disabled') : ''}${model.$attr('id')}`;

				if (fs.existsSync(dir + newUrl)) {
					model.filename = indigo.getModuleWebDir(req) + newUrl;
					html = ejs.render(fs.readFileSync(model.filename, 'utf-8'), req.model);
				}

				if (model.opts.show === false) {
					model.opts.parentStyle = `display: none; ${model.opts.parentStyle || ''}`;
				}
				html = `${begin}${model.$attr('parentStyle', 'style')}>${html}</${cTag}>`;

				model.componentIndex++;
				return html;
			} catch(err) {
				indigo.logger.error(err);
			}
		}
		return '';
	};

	/**
	 * @memberOf sourceloader
	 * @alias component.js#finalize
	 */
	app.locals.finalize = (req, ...args) => {
		debug('Include scripts: %s', JSON.stringify(req.model.assets));

		const dir = indigo.getModuleWebDir(req),
			isDev = indigo.appconf.get('environment') === 'dev',
			lines = [],
			libs = [];
		for (var className in req.model.assets) {
			const asset = req.model.assets[className],
				lessFile = indigo.getNewURL(req, null, `/components/${asset.pkg}/${asset.type}/${asset.type}.less`),
				jsFile = indigo.getNewURL(req, null, `/components/${asset.pkg}/${asset.type}/${asset.type}.js`);

			if (!fs.existsSync(dir + jsFile)) {
				className = '!' + className;
			}
			if (!fs.existsSync(dir + lessFile)) {
				className += '!';
			}
			libs.push(className);
		}

		const baseStaticPath = ''; //jshint: 'baseStaticPath' is not defined.
		lines.push(`<script>
			var core = document.querySelector('script[rel=igocore]'),
				script = document.createElement('script');
			if (core) {
				document.head.removeChild(core);
			}
			script.src = '${isDev ? '/default/components/js/loader.js' : baseStaticPath + '/js/loader.min.js'}';
			script.setAttribute('rel', 'igocore');
			script.setAttribute('libs', '${libs.join(',')}');
			script.setAttribute('uri', '${indigo.getComponentPath()}');
			document.head.appendChild(script);
		</script>`);

		if (args.length) {
			lines.push(`<input igo-main type="hidden" value="${args.join()}"/>`);
		}

		return lines.join('\n');
	};
};


module.exports.renderLess = (lessFile, req, res, next) => {
	debug(req.method, lessFile);

	if (fs.existsSync(lessFile)) {
		const dir = indigo.getModuleWebDir(req),
			cache = parseInt(indigo.appconf.get('server:cache')),
			isDev = indigo.appconf.get('environment') === 'dev';

		res.setHeader && res.setHeader('Cache-Control', 'public, max-age=' + 
				(!isNaN(cache) ? cache : 3600)); //or one hour

		fs.readFile(lessFile, (error, data) => {
			less.render(data.toString(), {
					filename: lessFile,
					compress: !isDev,
					paths: [`${dir}/default`, `${dir}/default/components`]
				}, (error, result) => {
					res.set('Content-Type', 'text/css');
					if (!error) {
						res.write(result.css);
						res.end();
					} else {
						indigo.error(error);
						res.send(data);
					}
				});
		});
		return;
	}
	next();
};