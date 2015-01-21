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
					var language = $('#language');
					language.change(function() {
						var option = language.find('option:selected');
						$rootScope.localizedLocale = {'key': option.val().toUpperCase(), 'name': option.text()};
						$rootScope.$apply();
					});
					language.trigger('change');
				});

				angular.bootstrap(this.div[0], [appName]);

				this.div.show();
				$('div.loading').hide();
			}
		};

		return localization;
});