'use strict';

define([
	'jquery'
], function($){
	var tooltip, active;
	return tooltip = {
		initialize: function(isTriggerText, timeout) {
			var indigo_tooltips = $('.indigo_tooltip');

			for (var i = 0; i < indigo_tooltips.length; i++) {
				this.init_tooltip($(indigo_tooltips[i]), 'trigger', isTriggerText, timeout);
			}
		},

		init_tooltip: function(indigo_tooltip, trigger, isTriggerText, timeout) {
			var marginTop = parseInt(indigo_tooltip.css('margin-top')),
				marginLeft = parseInt(indigo_tooltip.css('margin-left')),
				parentWidth = 0;

			timeout = timeout || 500;

			indigo_tooltip.mouseover(function() {
				tooltip.close_tooltip(timeout, indigo_tooltip);
			});
			indigo_tooltip.mouseout(function() {
				tooltip.close_tooltip(timeout);
			});

			if (typeof(trigger) === 'string') {
				trigger = $(indigo_tooltip.attr(trigger));
			}

			if (trigger && trigger.length) {
				parentWidth = parseInt(trigger.css('width'));
				trigger.mouseover(function(e) {
					if (isTriggerText) {
						indigo_tooltip.text(e.currentTarget.innerText);
					}
					tooltip.close_tooltip(timeout, indigo_tooltip);
				});
				trigger.mouseout(function() {
					tooltip.close_tooltip(timeout);
				});
			}

			if (marginTop > 0) {
				indigo_tooltip.css('margin-top', '-' + (parseInt(indigo_tooltip.css('height')) + marginTop) + 'px');
			}

			if (marginLeft > 0) {
				indigo_tooltip.css('margin-left', '-' + 
					(parseInt(indigo_tooltip.css('width')) / 2 - parentWidth / 2 + marginLeft) + 'px');
			}
		},

		close_tooltip: function(timeout, indigo_tooltip) {
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
				}, timeout);
			}
		}
	};
});