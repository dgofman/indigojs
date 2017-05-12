/*jshint unused:false*/
function RadioGroup($, indigo) {
	'use strict';
	indigo.debug('Init RadioGroup');

	return {
		register: function(el) {
			this.getRadios(el).filter('[value=' + el.text() + ']').prop('checked', true);
		},

		init: function(el, self) {
			this.$inputs = this.getRadios(el);
			this.$labels = this.$inputs.parent();
			this.$radios = this.$labels.parent();
			this.$inputs.event('change.value', function (e) {
				self.value = $(e.currentTarget).val();
			});
		},

		value: {
			get: function() {
				return this.$inputs.filter(':checked').val();
			},
			set: function(value) {
				this.$inputs.filter('[value="' + value + '"]').prop('checked', true);
			}
		},

		label: {
			get: function() {
				return this.$inputs.filter(':checked').parent().text();
			},
			set: function(value) {
				this.$inputs.filter(':checked').parent().text(value);
			}
		},

		getRadios: function(el) {
			return $('[cid=radio]>label>input[name="' + el.attr('id') + '"]');
		},

		class: function(name, isAdd) {
			return isAdd ? this.$radios.addClass(name) : this.$radios.removeClass(name);
		}
	};
}