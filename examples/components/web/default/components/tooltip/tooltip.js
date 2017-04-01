/*jshint unused:false*/
function Tooltip($, indigo) {
	'use strict';
	indigo.debug('Init Tooltip');

	var arrow_gap = 10;

	return {
		register: function(el) {
			el.off('mouseover');
			el.off('mouseout');

			if (el.parent().css('position') === 'static') {
				el.parent().css('position', 'relative');
			}

			var div = el.find('>div'),
				p = div.find('>p'),
				scrollInterval = parseInt(div.attr('scroll')),
				scrollTop, interval;
			if (p.html() === '') {
				p.html(el.parent().text());
			}

			if (!isNaN(scrollInterval)) {
				el.on('mouseover', function() {
					clearInterval(interval);
					p.scrollTop(scrollTop = 0);
					interval = setTimeout(function() {
						clearTimeout(interval);
						interval = setInterval(function() {
							p.scrollTop(++scrollTop);
							if (scrollTop !== p.scrollTop()) {
								clearInterval(interval);
							}
						}, scrollInterval);
					}, parseInt(div.attr('scrollTimeout')) || 500);
				}).on('mouseout', function() {
					clearInterval(interval);
				});
			}

			el.on('mouseover', function() {
				switch(div.attr('class')) {
					case 'left':
						div.css('margin-left', -div.outerWidth() - arrow_gap);
						break;
					case 'right':
						div.css('margin-left', el.outerWidth() + arrow_gap);
						break;
					case 'bottom':
						div.css('margin-top', el.outerHeight() + arrow_gap);
						break;
					default:
						div.css('margin-top', -div.outerHeight() - arrow_gap);
				}

				switch(div.attr('class')) {
					case 'top':
					case 'bottom':
						return div.css('margin-left', -((div.outerWidth() - el.outerWidth()) / 2));
					case 'left':
					case 'right':
						return div.css('margin-top', -((div.outerHeight() - el.outerHeight()) / 2));
				}
			});
		},

		init: function(el) {
			this.$label = $('>div>p', el);
		},

		value: {
			get: function() {
				return this.$label.html();
			},
			set: function(value) {
				this.$label.html(value);
			}
		}
	};
}