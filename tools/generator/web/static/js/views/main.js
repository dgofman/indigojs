'use strict';

window.top.ready(window, function($, indigo) {
	indigo.debug('Init Main');

	indigo.import('checkbox', 'switch', 'button', function(Checkbox, Switch, Button) { //callback class references

		var model = {checked: false, label: 'Hello IndigoJS'},
			ns = indigo.namespace('[ig-ns=check_switch]'),
			chk = ns.create(Checkbox),
			sch = ns.create(Switch),
			btn = ns.create(Button, 1);

		indigo.bind('checked', [{checked: chk}, {checked: sch}, {disabled: btn, handle: function(value, prop) {
			this[prop] = !value;
		}}], model);

		indigo.namespace('[ig-ns=menu_text]', function(ns) {
			var Dropdown = indigo.import('dropdown'), //import as single class
				imports = indigo.import('input', 'text', 'tooltip'), //assign array of classes
				Input = imports[0], //input
				dpd = ns.create(Dropdown),
				int = ns.create(Input), 
				txt = ns.create(imports[1]), //text
				tlt = ns.create(imports[2]); //tooltip

			indigo.bind('selectedIndex', [{index: dpd}, {value: ns.create(Input, '#selDropIndex')}]); //bind a new private model

			indigo.bind('label', [{value: txt}, {value: int}, {value: tlt}, {label: dpd, handle: function(value, prop, model) {
				indigo.info('checked: ' + model.checked + ', label: ' + model.label);
				this.indexByLabel(value);
				this[prop] = value;
			}}], model);
		});
	});
});