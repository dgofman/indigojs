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

		html: function(val) {
			var el = $('>span', this.el);
			return val === undefined ? el.html() : el.html(val);
		},

		text: function(val) {
			var el = $('>span', this.el);
			return val === undefined ? el.text() : el.text(val);
		},

		val: function(val) {
			return this.html(val);
		}
	};
}