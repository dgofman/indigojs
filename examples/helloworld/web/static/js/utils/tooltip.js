'use strict';

define([
	'jquery'
], function($){
	var tooltip, active;
	return tooltip = {
		initialize: function() {
			var indigo_tooltips = $('.indigo_tooltip');

			for (var i = 0; i < indigo_tooltips.length; i++) {
				this.init_tooltip($(indigo_tooltips[i]));
			}
		},

		init_tooltip: function(indigo_tooltip) {
			var trigger = $(indigo_tooltip.attr('trigger'));

			if (!parseInt(indigo_tooltip.css('margin-top'))) {
				indigo_tooltip.css('margin-top', '-' + (parseInt(indigo_tooltip.css('height')) + 10) + 'px');
			}

			if (!parseInt(indigo_tooltip.css('margin-left'))) {
				indigo_tooltip.css('margin-left', '-' + 
					((parseInt(trigger.css('width')) - parseInt(indigo_tooltip.css('width'))) / 2) + 'px');
			}

			if (trigger.length) {
				trigger.mouseover(function() {
					tooltip.close_tooltip(indigo_tooltip);
				});
				trigger.mouseout(function() {
					tooltip.close_tooltip();
				});

				indigo_tooltip.mouseover(function() {
					tooltip.close_tooltip(indigo_tooltip);
				});
				indigo_tooltip.mouseout(function() {
					tooltip.close_tooltip();
				});
			}
		},

		close_tooltip: function(indigo_tooltip) {
			active = active || indigo_tooltip;
			clearInterval(active.interval);
			if (indigo_tooltip) {
				active.css('display', 'none');
				indigo_tooltip.css('display', 'block');
				active = indigo_tooltip;
			} else {
				active.interval = setInterval(function() {
					clearInterval(active.interval);
					active.css('display', 'none');
				}, 500);
			}
		}
	};
});