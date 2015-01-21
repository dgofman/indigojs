'use strict';

define([
	'jquery',
	'angular'
], function($) {

	var grid,
		gridData,
		parentdWidth = 0;

	var fileLoadedHandler = function(evt, files) {
		//gridData = files;
		createGrid();
	};

	var createGrid = function() {
		if (grid) {
			parentdWidth = grid.parent().width();
			grid.GridUnload();
		}

		var width = 0,
			columns = window.Localization.columns || {},
			colModel = [ {name: 'key', index: 'key', width: 200}, 
						{name: 'locale', index: 'locale', width: 500, align: 'center'},
						{name: 'path', index: 'path'} ];

		for (var i = 0; i < colModel.length - 1; i++) {
			width += colModel[i].width;
		}
		colModel[i].width = parentdWidth - width;

		grid = $('.jqGridContainer > .jqgrid').jqGrid({
			colNames: [columns.key, 
						 columns.localized,
						 columns.path], 
			datatype: 'local',
			data: gridData,
			colModel: colModel, 
			viewrecords: false,
			shrinkToFit: false,
			width: null
		});
	};

	return function (appService, $scope) {
		$scope.$on('FILE_LOADED_EVENT', fileLoadedHandler);

		createGrid();

		var win = $(window).bind('resize', function() {
			if (grid.parent().width() === 0) {
				setTimeout(function() { win.trigger('resize'); }, 100);
			} else if (grid.parent().width() !== parentdWidth) {
				createGrid();
			}
		}).trigger('resize');
	};
});