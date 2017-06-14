'use strict';

(function($, indigo) {
	indigo.info('Init Main');

	//Example 1.
	var model = {ipt1Value: 'Value1', ipt2Value: 'Value2'},
		parent = $('div[ex1]'),
		div = parent.find('div.output'),
		watch = function(name, value, model, e) {
			indigo.debug('div[ex1]', name, value, e.type);
			div.html('<b>Name:</b> ' + name + '<br><b>Value:</b> ' + value + '<br><b>Model</b>: ' + JSON.stringify(model));
		},
		ipt1 = indigo.create('Input', 0, parent),
		ipt2 = indigo.create('Input', 1, parent),
		ipt3 = indigo.create('Input', 2, parent);

	indigo.bind(model, 'ipt1Value', 'value', ipt1, watch);
	indigo.bind(model, 'ipt2Value', 'value', ipt2, watch);
	indigo.bind(model, 'ipt3Value', 'value', ipt3, watch);

	//Example 2.
	indigo.namespace('div[ex2]', function(ns) {
		var Input = indigo.import('Input'),
			div = ns.$('div.output');
		indigo.watch({ipt1Value: 'Value1', ipt2Value: 'Value2'}, function(name, value, model, e) {
			indigo.debug('div[ex2]', name, value, e.type);
			div.html('<b>Name:</b> ' + name + '<br><b>Value:</b> ' + value + '<br><b>Model</b>: ' + JSON.stringify(model));
		})
		.bind('ipt1Value', 'value', ns.create(Input))
		.bind('ipt2Value', 'value', ns.create(Input, 1))
		.bind('ipt3Value', 'value', ns.create(Input, 2));
	});

	//Example 3.
	indigo.namespace('div[ex3]', function(ns) {
		var model = {sharedValue: 'IndigoJS'},
			div = ns.$('div.output'),
			Input = indigo.import('Input'),
			ipt1 = ns.create(Input), //document.querySelector('div[ex3] [_=igoInput]')
			ipt2 = ns.create(Input, 1), //document.querySelectorAll('div[ex3] [_=igoInput]')[1]
			ipt3 = ns.create(Input, '.ipt_class'), //document.querySelector('div[ex3] [_=igoInput].ipt_class')
			watch = function(name, value, model, e) {
				indigo.debug('div[ex3]', name, value, e.type);
				div.html('<b>Name:</b> ' + name + '<br><b>Value:</b> ' + value + '<br><b>Model</b>: ' + JSON.stringify(model));
			};

		//bind multiple components to the same property name in the model
		indigo.bind(model, 'sharedValue', 'value', ipt1, watch)
					.bind('sharedValue', 'value', ipt2)
					.bind('sharedValue', 'value', ipt3).trigger('keydown keyup'); //attach additional keydown and keyup events
	});

	//Example 4.
	indigo.namespace('div[ex4]', function(ns) {
		var div = ns.$('div.output'),
			Input = indigo.import('Input');
		indigo.watch({sharedValue: 'IndigoJS'}, function(name, value, model, e) {
			indigo.debug('div[ex4]', name, value, e.type);
			div.html('<b>Name:</b> ' + name + '<br><b>Value:</b> ' + value + '<br><b>Model</b>: ' + JSON.stringify(model));
		})
		.bind('sharedValue', 'value', [ns.create(Input), ns.create(Input, 1), ns.create(Input, '.ipt_class')]).trigger('keydown keyup');
	});

	//Example 5.
	indigo.namespace('div[ex5]', function(ns) {
		var model = {sharedValue: true},
			watchHandlers = [],
			watch = function(type) {
				return function() {
					watchHandlers.push(watchHandlers.length + ' - ' + type);
					div.html(watchHandlers.join(', '));
				};
			},
			div = ns.$('div.output'),
			sch = ns.create('Switch'),
			cbx = ns.create('Checkbox'),
			btn = ns.create('Button');

		indigo.bind(model)
			.bind('sharedValue', 'checked', sch, watch('Switch'))
			.bind('sharedValue', 'checked', cbx, watch('Checkbox'))
			.bind('sharedValue', 'disabled', btn, watch('Button'));

		btn.click = function() {
			watchHandlers = [];
			model.sharedValue = true;
		};
	});

	//Example 6.
	indigo.namespace('div[ex6]', function(ns) {
		var model = {sharedValue: true},
			watchHandlers = [],
			watch = function(type) {
				return function() {
					watchHandlers.push(watchHandlers.length + ' - ' + type);
					div.html(watchHandlers.join(', '));
				};
			},
			div = ns.$('div.output'),
			btn = ns.create('Button');

		indigo.bind(model, 'sharedValue', [
			{$watch: watch('Switch'),   'checked' : ns.create('Switch')},
			{$watch: watch('Checkbox'), 'checked' : ns.create('Checkbox')},
			{$watch: watch('Button'),   'disabled': btn}]);

		btn.click = function() {
			watchHandlers = [];
			model.sharedValue = true;
		};
	});

	//Example 7.
	indigo.import('Text', 'Input', 'Switch', 'Checkbox', function(Text, Input, Switch, Checkbox) {
		var chars = [],
			ns = indigo.namespace('div[ex7]'),
			txt = ns.create(Text),
			watch = function(name, value, model, e) {
				indigo.debug('div[ex7]', name, value, e.type);
				txt.value = '<b>Name:</b> ' + name + '<br><b>Value:</b> ' + value + '<br><b>Model</b>: ' + JSON.stringify(model);
			};

		indigo.watch({swhValue: true, chkValue: true}, watch)
			.bind('iptValue', 'value', ns.create(Input), function(name, value, model, e) {
				if (e.type === 'keydown') {
					var code = e.which || e.keyCode;
					if (code === 8) {
						chars.pop();
					} else {
						chars.push(String.fromCharCode(code));
					}
				}
				this.$input.val((value || '').replace(/./g, '*')); //mask value in component input box
				model[name] = chars.join(''); //assign actual value into model
				watch(name, value, model, e);
			}).trigger('keydown keyup')
			.bind('swhValue', 'checked', ns.create(Switch))
			.bind('chkValue', 'checked', ns.create(Checkbox));
	});
})(window.$, window.indigoJS);