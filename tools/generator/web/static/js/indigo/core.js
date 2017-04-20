'use strict';

var indigoStatic = window.top.indigoStatic,
	rootScope = window.top.rootScope || {};

require.config({
	baseUrl: indigoStatic['staticPath'] + '/js',

	paths: {
		jquery: 'vendor/jquery-3.1.1' + (indigoStatic.DEBUG ? '' : '.min')
	},

	callback: function() {
		require([
			'jquery'
		], function($) {
			window.indigo = indigoJS.extend;
			initComponents();
			if (indigoStatic.jqueryReady) {
				indigoStatic.jqueryReady($, window.indigo);
			}
		});
	}
});

var console = window.console,
	initComponents = function() {
		for (var selector in indigoJS.initPending) {
			var item = indigoJS.initPending[selector];
			delete indigoJS.initPending[selector];
			item.init.call(indigoJS.extend, item.win);
		}
	},
	indigoJS = {
	components: {},
	initPending: {},
	bindProperties: function(bindMap, callback) {
		for (var name in bindMap) {//find a bind property name
			if (name !== '$watch') {
				return callback({name: name, self: bindMap[name], $watch: bindMap.$watch});
			}
		}
	},
	extend: {
		window: window,
		static: indigoStatic,
		rootScope: rootScope,
		debug: function() {
			if (this.static.DEBUG && console) {
				console.log.apply(console, arguments);
			}
		},
		info: function() {
			if (this.static.INFO && console) {
				console.info.apply(console, arguments);
			}
		},
		uid: function () {
			'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
				return v.toString(16);
			});
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
		create: function(clazz, idxOrSelector, parent) {
			parent = parent || window.$('body');
			if (typeof clazz === 'string') {
				clazz = this.import(clazz);
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
		},
		namespace: function(selector, callbak) {
			var self = this,
				parent = this.window.$(selector),
				ns = {
					create: function(clazz, idxOrSelector) {
						self.create.apply(self, clazz, idxOrSelector, parent);
					}
				};
			if (callbak) { callbak(ns); }
			return ns;
		},
		watch: function(model, handle) {
			var self = this;
			return {
				bind: function(name, bindMap) {
					return self.bind(name, bindMap, model, handle);
				}
			};
		},
		bind: function(name, bindMap, model) {
			model = model || {};
			if (!Array.isArray(bindMap)) { //single bind
				bindMap = [bindMap];
			}
			for (var i = 0; i < bindMap.length; i++) {
				indigoJS.bindProperties(bindMap[i], function(o) {
					o.self.$el.on(o.name, function(e, value) {
						model[name] = value;
						if (o.$watch) {
							if (o.self[o.name] !== value) {
								o.$watch.call(o.self, o.name, value, model);
							}
						}
					});
				});
			}

			var self = this, 
				watch = arguments[3],
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
								if (o.$watch) {
									o.$watch.call(o.self, o.name, value, model);
								} else {
									o.self[o.name] = value;
								}
							});
						}
						if (watch && model[name] !== undefined) {
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
					clazz.prototype.onEvent = function(type, comp, intercept) {
						var _hanlder,
							uid = indigo.uid();
						Object.defineProperty(this, type, {
							get: function() {
								return _hanlder;
							},
							set: function(hanlder) {
								comp.event(type + '.' + uid, _hanlder = hanlder);
								if (intercept) {
									intercept(hanlder, uid);
								}
							}
						});
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
								return (this.$el.length && this.$el[0].getClientRects().length > 0);
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
		initComponents();
	}
};

//View registration
window.ready = function(win, callback) {
	indigoJS.initPending['main'] = {
		win: win, init: function(win) {
			if (!win.jQuery) {
				window._jQueryFactory(win);
			}
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
		initComponents();
	}
};