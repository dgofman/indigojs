'use strict';

define(['./validate'], function(Validate) {
	var $ = this.$;
	var _, _static = window.top.indigoStatic,
		indigo = window.top.indigo,
		errorDlg = indigo.create('dialog', '#error_dlg', window.top.$('body'));
	return _ = {
		wait_overlay: null,
		validate: function(model, verifyByName) {
			return new Validate(model, verifyByName);
		},
		isEmpty: function(val) {
			return val !== 0 && val !== false && !val;
		},
		addClass: function(name, comp, isAdd) {
			comp.class(name, isAdd);
		},
		basePath: function(b) {
			return _static[b ? 'contextPath' : 'portalPath'];
		},
		redirect: function(path, win) {
			var base = this.basePath(win);
			win = win || window.top;
			if (Array.isArray(path)) {
				path = path.join('');
			}
			win.location.href = base + path;
		},
		scrollView(comp) {
			comp.$el[0].scrollIntoView(true);
		},
		errorDialog: function(error, name, title) {
			indigo.debug(JSON.stringify(error));
			var content = typeof error === 'string' ? error : error[name];
			errorDlg.title = title || errorDlg.defaultTitle;
			errorDlg.content = content || errorDlg.defaultContent;
			errorDlg.show = true;
		},
		requestOverlay: function(type) {
			if (!_.wait_overlay) {
				_.wait_overlay = window.top.$('.wait_overlay');
			}
			_.wait_overlay[type]();
		},
		regForm: function(target) {
			$('c[cid]', target).each(function(i, dom) {
				var el = $(dom);
				indigo.register(el.attr('cid'), el);
			});
		},
		substitute: function(str) {
			for (var i = 1; i < arguments.length; i += 2) {
				str = str.replace(new RegExp(arguments[i], 'g'), arguments[i + 1] || '');
			}
			return str;
		},
		request: function(callback, path, data, type, skip_overlay, contentType) {
			if (!skip_overlay) {
				_.requestOverlay('show');
			}
			return window.top.$.ajax({
				type: type || 'GET',
				url: _static['contextPath'] + path,
				data: data ? JSON.stringify(data) : null,
				contentType: contentType === undefined ? 'application/json' : contentType,
				async: true,
				cache: false,
				processData: false,
				success: function(data, status, jqXHR) {
					_.requestOverlay('hide');
					callback(null, data, status, jqXHR);
				},
				error: function(jqXHR) {
					_.requestOverlay('hide');
					if (jqXHR.status === 302) {
						window.top.location.reload(true);
					} else if (jqXHR.status === 0 || jqXHR.status === 404) { //abort
						_.errorDialog(jqXHR.responseJSON || jqXHR.responseText);
					} else {
						callback(jqXHR.responseJSON || jqXHR.responseText, null, jqXHR);
					}
				}
			});
		}
	};
});