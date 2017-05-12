/*jshint unused:false*/
function Tooltip($, indigo) {
	'use strict';
	indigo.debug('Init Tooltip');

	var arrow_gap = 7;

	return {
		register: function(el) {
			var div = $('>div', el);
			if (div.attr('target')) {
				var targets = div.attr('target').split(','),
					origPosition = div.attr('position'),
					arr = (origPosition || 'top').split('-'),
					position = arr[0],
					align = arr[1] || (position === 'top' || position === 'bottom' ? 'center' : 'middle'),
					scrollInterval = parseInt(div.attr('scroll')),
					p = $('>div>p', el),
					value = p.html(), scrollTop, interval;
				targets.forEach(function(t) {
					$(t).event('mouseout.target', function(e) {
						el.hide();
						clearInterval(interval);
					}).event('mouseover.target', function(e) {
						var target = $(e.currentTarget),
							css = target.offset();
						el.show();
						if (!value) {
							p.text(target.text());
						}
						if (!origPosition || origPosition === 'auto') {
							position = 'top';
							align = 'left';
							if (css.top - div.outerHeight() < 0) {
								position = 'bottom';
							}
							if (css.left + target.outerWidth() + div.outerHeight() > document.body.clientWidth) {
								align = 'right';
							}
							div.attr('position', position + '-' + align);
						}

						switch(position) {
							case 'top':
								css.top -= div.outerHeight() + arrow_gap;
								break;
							case 'bottom':
								css.top += target.outerHeight() + arrow_gap;
								break;
							case 'left':
								css.left -= div.outerWidth() + arrow_gap;
								break;
							case 'right':
								css.left += target.outerWidth() + arrow_gap;
								break;
						}


						switch (align) {
							case 'right':
								css.left += target.outerWidth() - div.outerWidth();
								break;
							case 'center':
								css.left += target.outerWidth() / 2 - div.outerWidth() / 2;
								break;
							case 'bottom':
								css.top += target.outerHeight() - div.outerHeight();
								break;
							case 'middle':
								css.top += target.outerHeight() / 2 - div.outerHeight() / 2;
								break;
						}


						if (!isNaN(scrollInterval)) {
							p.scrollTop(scrollTop = 0);
							interval = setTimeout(function() {
								clearTimeout(interval);
								interval = setInterval(function() {
									p.scrollTop(++scrollTop);
									if (scrollTop > p.scrollTop() + 1) {
										clearInterval(interval);
									}
								}, scrollInterval);
							}, parseInt(div.attr('scrollTimeout')) || 500);
						}

						el.css(css);
					});
				});
			}
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