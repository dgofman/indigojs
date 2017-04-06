'use strict';

define(['./validate'], function(Validate) {
	var _, _static = window.top.indigoStatic;
	return _ = {
		wait_overlay: null,
		validate: function(model, verifyByName) {
			return new Validate(model, verifyByName);
		}, 
		addClass: function(cls, el, isTrue) {
			el.removeClass(cls);
			if (isTrue) {
				el.addClass(cls);
			}
		},
		redirect: function(path, top) {
			var win = top ? window.top : window;
			if (Array.isArray(path)) {
				path = path.join('');
			}
			win.location.href = _static['contextPath'] + path;
		},
		errorDialog: function(error) {
			alert(JSON.stirngify(error));
		},
		requestOverlay: function(type) {
			if (!_.wait_overlay) {
				_.wait_overlay = window.$('.wait_overlay');
			}
			_.wait_overlay[type]();
		},
		request: function(callback, path, data, type, skip_overlay) {
			if (!skip_overlay) {
				_.requestOverlay('show');
			}
			return window.$.ajax({
				type: type || 'GET',
				url: _static['contextPath'] + path,
				data: data ? JSON.stringify(data) : null,
				contentType: 'application/json',
				async: true,
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