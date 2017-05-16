'use strict';

window.top.ready(window, function($, indigo) {
	indigo.debug('Init Main');

	var map = {}, as = [], active, start = 0,
		h1s = $('h1[id]');
	h1s.each(function(index, h1) {
		var top, next = h1s[index + 1],
			a = document.querySelector('.left a[href="#' + h1.id + '"]');
		if (next) {
			top = next.getBoundingClientRect().top;
		} else {
			top = document.body.scrollHeight;
		}
		map[h1.id] = {start: start, end: top, a: a};
		as.push(a);
		start = top;
	});
	window.onscroll = function() {
		var el = document.scrollingElement || document.documentElement,
			pos = el.scrollTop + 300;
		for (var id in map) {
			var o = map[id];
			if (pos >= o.start && pos < o.end) {
				if (active !== o.a) {
					active = o.a;
					as.forEach(function(a) {
						a.className = null;
					});
					active.className = 'selected';
				}
			}
		}
	};
	window.onscroll();

	/*indigo.import('checkbox', 'switch', 'button', function(Checkbox, Switch, Button) { //callback class references

		indigo.namespace('[ig-ns=one-binding', function(ns) {
			var login_model = {username: 'User', password: '12345'};
			//Bind value(s) to the model
			indigo.watch(login_model, function(name, value) { //watch function
							indigo.debug(name + '=' + value);
					})
					.bind('username', {value: ns.create('input', 0)})
					.bind('password', {value: ns.create('input', 1)});

			ns.create('button').click = function() {
				alert(JSON.stringify(login_model));
			};
		});

		var model = {readOnlyValue: 'NULL', bindState: false, bindLabel: 'Hello IndigoJS'};

		indigo.namespace('[ig-ns=menu_text]', function(ns) {
			var Dropdown = indigo.import('dropdown'), //import as single class
				imports = indigo.import('input', 'text', 'tooltip'), //assign array of classes
				Input = imports[0], //input
				sch = ns.create('switch'), //Create class by name
				chk = ns.create(Checkbox),
				rng = ns.create(Input, '#selDropIndex'), //Create component by assigning CSS selector
				dpd = ns.create(Dropdown),
				btn = ns.create(Button),
				int = ns.create(Input), 
				txt = ns.create(imports[1]), //text
				tlt = ns.create(imports[2]); //tooltip

			//Bind Dropdown selected index and input text
			  indigo.bind('selectedIndex', [{index: dpd}, {value: rng}]) //create and bind a new model
					//Bind Checkbox and Dropdown access
					.bind('disableDropdown', [{checked: chk}, {disabled: dpd}])
					//Bind Switch and Dropdown open/close popup menu
					.bind('popupDropdown', [{checked: sch}, {open: dpd}]);

			//Bind text values between Text, Input, Tooltip, Checkbox, Button, DropDown components
			indigo.bind('bindLabel', [{value: txt}, {value: int}, {value: tlt}, {label: chk}, {label: btn}, {prompt: dpd, $watch: function(name, value, model) {
				indigo.info('Dropdown name: ', name, ', value: ', value, ' model: ', JSON.stringify(model));
				this.indexByText(value);
				this[name] = value;
			}}], model);
		});

		var ns = indigo.namespace('[ig-ns=check_switch]'),
			img = ns.create(indigo.import('image')),
			txt = ns.create(indigo.import('text')),
			chk = ns.create(Checkbox),
			sch = ns.create(Switch),
			btn = ns.create(Button, 1); //Create component by using order index

		btn.click = function() {
			alert('Hello World');
		};

		//Bind url value of Image component and Text
		indigo.bind('imageUrl', [{url: img}, {text: txt, $watch: function(name, value) {
			this.value = '<a href=#>' + value + '</a>';
		}}], model);

		img.url = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png';

		//Bind Switch and Checkbox state with Button access and editable Text
		indigo.bind('bindState', [{checked: chk}, {checked: sch}, {editable: txt}, {disabled: btn, $watch: function(name, value) {
			this[name] = !value;
		}}], model);
	});*/
});