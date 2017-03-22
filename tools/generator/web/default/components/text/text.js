function($, indigo) {
	indigo.debug('Init Text');

	return {
		register: function(el) {
			var elps = $('>.ellipsis', el);
			if (elps.length) {
				var lh = parseInt(elps.parent().css('line-height'));
					mt = Math.max(Math.round(elps.parent().parent().outerHeight() / lh - 1) * lh, 0);
				elps.css({'bottom': 'auto', 'margin-top': mt, 'padding-left': elps.width()});
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