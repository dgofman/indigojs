'use strict';

define(['./validate'], function(Validate) {
	var _, _static = window.top.indigoStatic;
	return _ = {
		wait_overlay: null,
		validate: function(model, verifyByName) {
			return new Validate(model, verifyByName);
		},
		isEmpty: function(val) {
			return val !== 0 && val !== false && !val;
		},
		convert: function(type, value) {
			try {
				switch(type) {
					case 'number':
						return Number(value);
					case 'date':
						return new Date(value);
					case 'bool':
						return value === 'true';
					case 'isNull':
						if (value === '' || value === undefined) {
							return null;
						}
				}
			} catch (e) {}
			return value;
		},
		transform: function(source, rules) {
			var json = {};
			for (var id in source) {
				var model = json,
					value = source[id],
					rule = rules[id];
				if (rule && !rule.skip) {
					if (rule.name) {
						var arr = rule.name.split('.');
						for (var i = 0; i < arr.length - 1; i++) {
							if (model[arr[i]] === undefined) {
								model[arr[i]] = {};
							}
							model = model[arr[i]];
							id = arr[i + 1];
						}
					}
					model[id] = _.convert(rule.type, value);
				}
			}
			return json;
		},
		addClass: function(name, comp, isAdd) {
			comp.class(name, isAdd);
		},
		redirect: function(path, win) {
			win = win || window.top;
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