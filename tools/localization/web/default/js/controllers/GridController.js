'use strict';

define([
	'jquery',
	'angular'
], function($, angular) {

	var appServiceEventHandler = function(evt, key) {
		console.log(evt, key, $, angular);
	};

	var createGrid = function(element, parentdWidth, data) {
		var grid = element.find('.jqgrid'),
			width = 0,
			columns = window.Localization.columns || {},
			colModel = [ {name: 'key', index: 'key', width: 200}, 
						{name: 'locale', index: 'locale', width: 500, align: 'center'},
						{name: 'path', index: 'path'} ];

		for (var i = 0; i < colModel.length - 1; i++) {
			width += colModel[i].width;
		}
		colModel[i].width = parentdWidth - width;

		grid.jqGrid({
			colNames: [columns.key, 
						 columns.localized,
						 columns.path], 
			datatype: 'local',
			data: data,
			colModel: colModel, 
			viewrecords: false,
			shrinkToFit: false,
			width: null
		});
		return grid;
	};

	return function (appService, $scope, $element) {
		$scope.$on('appServiceChanged', appServiceEventHandler);

		var grid = createGrid($element, 0),
			parentdWidth,
			win = $(window).bind('resize', function() {
				if (grid.parent().width() === 0) {
					setTimeout(function() { win.trigger('resize'); }, 100);
				} else if (grid.parent().width() !== parentdWidth) {
					parentdWidth = grid.parent().width();
					grid.GridUnload();
					grid = createGrid($element, parentdWidth);
				}
		}).trigger('resize');
	};
});