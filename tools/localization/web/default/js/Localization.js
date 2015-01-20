'use strict';

define([
	'jquery',
	'angular',
	'gridController',
	'socketio'
], function($, angular, gridController) {

	var localization = function(params) {
			this.initialize(params);
			this.div.show();
		};

		localization.prototype = {

			initialize: function(params) {
				var appName = 'app',
					gridCntlName = 'gridController',
					app = angular.module(appName, []);

				$('input[type=file]').change(function () {
					$('#appConfFile').val(this.value);
				});

				app.service('appService', function($rootScope) {
					return {
						data: {},
						set: function(key, value) {
							this.data[key] = value;
							$rootScope.$broadcast('appServiceChanged', key);
						},
						get: function(key) {
							return this.data[key];
						}
					};
				});

				this.div = $(params.el);

				this.div.find('.jqGridContainer').attr('ng-controller', gridCntlName);
				app.controller(gridCntlName, ['appService', '$scope', '$element', gridController]);

				app.run(function($rootScope) {
					console.log($rootScope);
				});

				angular.bootstrap(this.div[0], [appName]);
			}
		};

		return localization;

	/*return Backbone.View.extend({
		events: {
			'click .submit': 'submit'
		},

		initialize: function() {
			this.div = $(this.el);

			socket = io.connect();
			socket.on('localize', function(data) {
				this.div.find('#msg').val(data);
			});
		},

		submit: function(e) {
			e.preventDefault();
			socket.emit('localize', 'TO DO');
		}
	});*/
});