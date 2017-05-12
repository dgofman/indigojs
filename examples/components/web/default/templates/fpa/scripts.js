'use strict';
window.indigoStatic.jqueryReady = function($, indigo) {
	$('body').fadeTo('fast', 1);
	var iframe = $('iframe.igo-content'),
		loadPage = function() {
			if (window.location.hash) {
				var page = window.location.hash.split('#').pop();
				if (page !== (iframe.attr('src') || '').split('/').pop()) {
					iframe.css('opacity', 0);
					iframe.attr('src', page.indexOf('/') !== -1 ? '<%- contextPath %>/' + page : 'fpa/' + page);
				}
			} else {
				window.location.href = '/';
			}
		};

	iframe.on('load', function() {
		iframe.fadeTo('slow', 1);
		indigo.debug('Page Ready');
		if (document.createEvent) {
			var event = document.createEvent('HTMLEvents');
			event.initEvent('Ready', true, true);
			window.dispatchEvent(event);
		} else {
			window.fireEvent('onReady', document.createEventObject());
		}
	});

	window.onhashchange = function() {
		loadPage();
	};
	loadPage();
};

window.top.sharedStyle = function(urls, target) {
	var lines = [], td = target.document, sd = window.top.document, d = [td];
	for (var s in sd.styleSheets) {
		var css = sd.styleSheets[s];
		urls.some(function(url, index) {
			if (css.href && css.href.indexOf(url) !== -1) {
				for (var i = 0; i < css.cssRules.length; i++) {
					lines.push(css.cssRules[i].cssText);
				}
				var style = td.createElement('style');
				style.innerHTML = lines.join('\n');
				td.head.appendChild(style);
				urls.splice(index, 1);
				return true;
			}
		});
	}
	if (sd !== td) { d.push(sd); }
	d.forEach(function(d) {
		urls.forEach(function(url) {
			var link = d.createElement('link');
			link.rel = 'stylesheet';
			link.type = 'text/css';
			link.href = url;
			d.head.appendChild(link);
		});
	});
};

window.top.sharedTemplate = function(url, selector, target) {
	var lines = [],
		templates = window.top.querySelector('script[type="text/igo-template"]'),
		content = templates.filter('[path="' + url + '"]').html();
	if (content) {
		lines.push(content);
	}
	return target.document.querySelector(selector).insertAdjacentHTML('beforeend', lines.join('\n'));
};