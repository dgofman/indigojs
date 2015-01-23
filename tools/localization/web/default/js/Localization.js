'use strict';

define([
	'jquery',
	'angular',
	'gridController'
], function($, angular, gridController) {

	var localization = function(params) {
			this.initialize(params);
			this.div.show();
		};

		localization.prototype = {

			initialize: function(params) {
				var appName = 'indigo',
					gridCntlName = 'gridController',
					app = angular.module(appName, []);

				app.service('appService', function($rootScope) {
					return {
						fileItems: function(items) {
							$rootScope.$broadcast('FILE_LOADED_EVENT', items);
						}
					};
				});

				this.div = $(params.el);

				this.div.find('.jqGridContainer').attr('ng-controller', gridCntlName);

				app.controller(gridCntlName, ['appService', '$rootScope', '$scope', '$http', gridController]);

				app.run(['appService', '$rootScope', '$http', $.proxy(this.afterRender, this)]);

				angular.bootstrap(this.div[0], [appName]);
			},

			afterRender: function(appService, $rootScope, $http) {
				var self = this,
					items = {},
					count = 0,
					filters = $('#filter option'),
					language = $('#language');

				language.change(function() {
					var option = language.find('option:selected');
					$rootScope.localizedLocale = {'key': option.val().toUpperCase(), 'name': option.text()};
					$rootScope.$apply();
				});
				language.trigger('change');

				$.each(filters, function(index, option) {
					if (option.value !== 'all') {
						self.loadFile($http, option.text, function(data) {
							var  arr = option.text.split('/'),
								files = items[arr[0]];
							if (!files) {
								items[arr[0]] = files = [];
							}
							files.push({name: arr[1], path: option.text, data: data});
							if (++count === filters.length - 1) { //excelude all
								self.div.show();
								$('div.loading').hide();
								appService.fileItems(items);
							}
						});
					}
				});
			},

			loadFile: function($http, path, cb) {
				$http.post('/localization/file', {path: path})
					.success(function(data) {
						cb(data);
					})
					.error(function(data, status, headers, config) {
						console.error(data, status, headers, config);
						cb(null);
					});
			}
		};

		return localization;
});