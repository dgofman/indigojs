/*jshint unused:false*/
function TextArea($, indigo) {
	'use strict';
	indigo.debug('Init TextArea');

	return {
		register: function(el) {
			$('>div', el).event('focus.input', function(e) {
				setTimeout(function() {
					$('>textarea', e.currentTarget).focus();
				}, 10);
			});
		},

		init: function(el, self) {
			self.$input = $('>div>textarea', el).event('change.val', function() {
				self.value = self.$input.val();
			});
			this.onEvent('change', self.$input);
			this.onEvent('enter', self.$input, function(handler, uid) {
				self.$input.event('keyup.' + uid, function (e) {
					if (e.which === 13) {
						handler.call(self, e);
					}
				});
			});
		},

		value: {
			get: function() {
				return this.$input.val();
			},
			set: function(value) {
				this.$input.val(value);
			}
		},

		focus: function() {
			this.$input.focus();
		}
	};
}