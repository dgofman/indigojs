'use strict';

define([
	'jquery',
	'angular'
], function($, angular) {

	var grid = null,
		appServiceEventHandler = function(evt, key) {
			console.log(key)
	};

	return function (appService, $scope, $element) {
		var columns = window.Localization.columns || {};

		$scope.$on('appServiceChanged', appServiceEventHandler);

		grid = $element.find('.jqgrid');
		grid.jqGrid({
			colNames: [columns.key, 
						 columns.localized,
						 columns.path], 
			colModel: [ {name: 'Column1', index: 'Column1', width: 90}, 
						{name: 'Column2', index: 'Column2', width: 100, align: 'center'},
						{name: 'Column3', index: 'Column3', width: 100, align: 'center'} ], 
			viewrecords: true
		});
	};
});