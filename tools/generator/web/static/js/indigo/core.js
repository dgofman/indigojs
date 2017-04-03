'use strict';

var indigoStatic = window.top.indigoStatic;

require.config({
	baseUrl: indigoStatic.getStaticPath() + '/js',

	paths: {
		jquery: 'vendor/jquery-3.1.1' + (indigoStatic.DEBUG ? '' : '.min')
	},

	callback: function() {
		require([
			'jquery'
		], function($) {
			window.indigo = indigoJS.extend;
			window.initComponents();
			$('body').fadeTo('fast', 1);
			var iframe = $('iframe.content'),
				loadPage = function() {
					var page = window.location.hash.split('#')[1] || 'default',
						url = indigoStatic.getContextPath() + '/content/' + page;
					window.indigo.debug('Load: ' + url);
					iframe.css('opacity', 0);
					iframe.attr('src', url);
				};

			iframe.on('load', function() {
				iframe.fadeTo('slow', 1);
				indigoJS.extend.debug('Page Ready');
				if (document.createEvent) {
					var event = document.createEvent('HTMLEvents');
					event.initEvent('Ready', true, true);
					window.dispatchEvent(event);
				} else {
					window.fireEvent('onReady', document.createEventObject());
				}
			});

			window.onhashchange = function() {
				loadPage();
			};
			loadPage();
		});
	}
});

var console = window.console,
	indigoJS = {
	components: {},
	initPending: {},
	bindProperties: function(bindMap, callback) {
		for (var prop in bindMap) {
			if (prop !== 'handle') {
				return callback({prop: prop, self: bindMap[prop], handle: bindMap.handle});
			}
		}
	},
	extend: {
		window: window,
		static: window.top.indigoStatic,
		debug: function() {
			if (this.static.DEBUG) {
				console.log.apply(console, arguments);
			}
		},
		info: function() {
			if (this.static.INFO) {
				console.info.apply(console, arguments);
			}
		},
		attr: function(el, type, val) {
			return val ? el.attr(type, type) : el.removeAttr(type);
		},
		class: function(el, name, val) {
			return val ? el.addClass(name) : el.removeClass(name);
		},
		import: function() {
			var clazz, callback, components = [],
				length = arguments.length;
			if (typeof arguments[length - 1] === 'function') {
				callback = arguments[--length];
			}
			for (var i = 0; i < length; i++) {
				clazz = indigoJS.components['[cid=' + arguments[i] + ']'];
				if (!clazz) {
					throw new Error('ClassNotFoundException: ' + arguments[i]);
				}
				components.push(clazz);
			}
			if (callback) {
				callback.apply(this, components);
			} else {
				return components.length === 1 ? components[0] : components;
			}
		},
		namespace: function(selector, callbak) {
			var self = this,
				parent = this.window.$(selector),
				ns = {
					create: function(clazz, idxOrSelector) {
						if (typeof clazz === 'string') {
							clazz = self.import(clazz);
						}
						var el, els = parent.find(clazz.selector),
							type = typeof(idxOrSelector);
						if (type === 'number') {
							el = els.eq(idxOrSelector);
						} else if (type === 'string') {
							el = els.filter(idxOrSelector);
						} else {
							el = els.eq(0);
						}
						return new clazz(el);
					}
				};
			if (callbak) { callbak(ns); }
			return ns;
		},
		bind: function(name, bindMap, model, watch) {
			model = model || {};
			watch = watch || function() {};
			if (!Array.isArray(bindMap)) { //single bind
				bindMap = [bindMap];
			}
			for (var i = 0; i < bindMap.length; i++) {
				indigoJS.bindProperties(bindMap[i], function(o) {
					o.self.$el.on(o.prop, function(e, value) {
						model[name] = value;
						if (o.handle) {
							if (o.self[o.prop] !== value) {
								o.handle.call(o.self, value, o.prop, model);
							}
						}
					});
				});
			}

			var self = this, 
				val = model[name];
			Object.defineProperty(model, name, {
				get: function() {
					return val;
				},
				set: function(value) {
					val = value;
					var proto = Object.getPrototypeOf(model);
					if (!proto['__propogate__' + name]) {
						proto['__propogate__' + name] = true;
						for (i = 0; i < bindMap.length; i++) {
							indigoJS.bindProperties(bindMap[i], function(o) {
								if (o.handle) {
									o.handle.call(o.self, value, o.prop, model);
								} else {
									o.self[o.prop] = value;
								}
							});
						}
						if (model[name] !== undefined) {
							watch(name, value);
						}
						delete proto['__propogate__' + name];
					}
				}, enumerable: true
			});
			model[name] = val;

			return {
				bind: function(name, bindMap, newModel) {
					return self.bind(name, bindMap, newModel || model, watch);
				}
			};
		}
	}
};

//jQuery loaded
window.initComponents = function() {
	for (var selector in indigoJS.initPending) {
		var item = indigoJS.initPending[selector];
		delete indigoJS.initPending[selector];
		item.init.call(indigoJS.extend, item.win);
	}
};

//Component registration
window.init = function(win, selector, factory) {
	var initPending = indigoJS.initPending;
	win.require = window.require;
	if (!initPending[selector]) {
		initPending[selector] = {
			win: win, init: function(win) {
				if (!win.jQuery) {
					window._jQueryFactory(win);
				}

				win.$.fn.extend({
					event: function(type, callback) {
						win.$.fn.off.call(this, type);
						win.$.fn.on.call(this, type, callback);
						return this;
					}
				});

				var components = window.top.indigoJS.components,
					indigo = indigoJS.extend,
					apis = factory(win.$, indigo, selector),
					clazz = components[selector];
				if (apis && !clazz) {
					clazz = function(el) {
						this.$el = el;
						this.init(el, this);
					};
					clazz.selector = selector;
					clazz.prototype.constructor = clazz;
					clazz.prototype.toString = function() {
						return selector + '::' + this.$el.html();
					};
					clazz.prototype.init = function() {};
					components[selector] = clazz;

					if (!apis.disabled) {
						apis.disabled = {
							get: function() {
								return !!this.$el.attr('disabled');
							},
							set: function(value) {
								indigo.attr(this.$el, 'disabled', value);
								return this;
							}
						};
					}

					if (!apis.show) {
						apis.show = {
							get: function() {
								return this.$el.is(':visible');
							},
							set: function(value) {
								value ? this.$el.show() : this.$el.hide();
							}
						};
					}

					for (var name in apis) {
						var descriptor = apis[name];
						if (descriptor && descriptor.set && descriptor.get) {
							descriptor.set = (function(set, type) {
								return function(value) {
									var proto = Object.getPrototypeOf(this);
									if (!proto['__propogate__' + type]) {
										proto['__propogate__' + type] = true;
										indigo.info(type, value, this.toString());
										set.call(this, value);
										this.$el.trigger(type, [value]);
									}
									delete proto['__propogate__' + type];
								};
							})(descriptor.set, name);
							Object.defineProperty(clazz.prototype, name, descriptor);
						} else if (name !== 'register') {
							clazz.prototype[name] = descriptor;
						}
					}
				}

				if (apis && apis.register) {
					win.$.each(win.$(selector), function(i, el) {
						apis.register(win.$(el));
					});
				}
			}
		};
	}

	if (window.jQuery) {
		window.initComponents();
	}
};

//View registration
window.ready = function(win, callback) {
	indigoJS.initPending['main'] = {
		win: win, init: function(win) {
			win.indigoJS = window.top.indigoJS;
			win.indigo = {};
			for (var name in win.indigoJS.extend) {
				win.indigo[name] = win.indigoJS.extend[name];
			}
			win.indigo.window = win;
			callback(win.$, win.indigo);
		}
	};
	if (window.jQuery) {
		window.initComponents();
	}
};