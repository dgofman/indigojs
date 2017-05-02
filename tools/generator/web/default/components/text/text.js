/*jshint unused:false*/
function Text($, indigo) {
	'use strict';
	indigo.debug('Init Text');

	return {
		register: function(el) {
			var span = $('>span', el);
			if (span.attr('height') === 'auto') {
				var height = el.outerHeight(),
					fs = parseFloat(span.css('font-size')),
					lh = parseFloat(span.css('line-height')) || parseFloat(span.css('height')) + 2,
					em = lh / fs,
					rows = height / (fs * em);
				span.css({'height': Math.floor(rows) * fs * em + 'px', '-webkit-line-clamp': Math.ceil(rows).toString()});
			}
		},

		init: function(el) {
			this.$label = $('>span', el);
		},

		value: {
			get: function() {
				return this.$label.html();
			},
			set: function(value) {
				this.$label.html(value);
			}
		},

		text: {
			get: function() {
				return this.$label.text();
			},
			set: function(value) {
				this.$label.text(value);
			}
		},

		editable: {
			get: function() {
				return this.$label.prop('contenteditable') === 'true';
			},
			set: function(value) {
				this.$label.prop('contenteditable', value);
			}
		}
	};
}