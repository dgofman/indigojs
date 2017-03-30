function($, indigo) {
	indigo.debug('Init Text');

	return {
		register: function(el) {
			var span = $('>span', el);
			if (span.attr('auto') === 'true') {
				var height = el.parent().outerHeight(),
					fs = parseFloat(span.css('font-size')),
					lh = parseFloat(span.css('line-height')),
					em = lh / fs;
					rows = Math.floor(height / (fs * em));
				span.css({'height': (rows * fs * em) + 'px', '-webkit-line-clamp': rows.toString()});
			}
		},

		value: {
			get: function() {
				return $('>span', this.el).html();
			},
			set: function(value) {
				$('>span', this.el).html(value);
			}
		},

		text: {
			get: function() {
				return $('>span', this.el).text();
			},
			set: function(value) {
				$('>span', this.el).text(value);
			}
		},

		editable: {
			get: function() {
				return $('>span', this.el).prop('contenteditable') === 'true';
			},
			set: function(value) {
				$('>span', this.el).prop('contenteditable', value);
			}
		}
	};
}