'use strict';

define([
	'jquery',
	'angular'
], function($) {

	var grid,
		gridData = [],
		fileMap = {},
		localeMap = {},
		defaultTxt,
		localizedTxt,
		localizedSpan,
		localizedB,
		parentdWidth = 0,
		selectedRowid = null;

	var fileLoadedHandler = function(evt, items) {
		var locale = window.Localization.defaultLocale,
			def = items[locale] || items[locale = locale.split('-')[0]];

		gridData = [];

		var defKeys = parseGridData(locale, def);
		delete items[locale];

		for (locale in items) {
			parseGridData(locale, items[locale], defKeys);
		}

		createGrid();
	};

	var parseGridData = function(locale, items, defKeys) {
		var keys = {};

		for (var i = 0; i < items.length; i++) {
			var item = items[i],
				fileData = [];
			keys[item.name] = {};
			for (var key in item.data) {
				keys[item.name][key] = item.data[key];
				fileData.push({ 'key': key,
								'localized': item.data[key],
								'path': item.path,
								'locale': locale,
								'original': item.data[key],
								'default': defKeys ? defKeys[item.name][key] : item.data[key]});
			}

			fileData = fileData.sort(function(a, b) {
				if(a.key < b.key) { return -1; }
				if(a.key > b.key) { return 1; }
				return 0;
			});
			gridData = gridData.concat(fileData);
			fileMap[item.path] = fileData;
		}

		return keys;
	};

	var createGrid = function() {
		if (grid) {
			parentdWidth = grid.parent().width();
			grid.GridUnload();
		}

		$.each(gridData, function(index, row) {
			row.id = index + 1;
		});

		var width = 0,
			columns = window.Localization.columns || {},
			colModel = [ { width: 24, cellattr: function (rowId, tv, rawObject, cm, rdata) {
								return ' class="glyphicon glyphicon-trash del-column"';
							}
						},
						 {name: 'key', index: 'key', width: 300}, 
						 {name: 'localized', index: 'localized', width: parentdWidth - 575 - 1}, //col1 + col2 + col4
						 {name: 'path', index: 'path', width: 250} ];

		grid = $('.jqGridContainer > .jqgrid').jqGrid({
			colNames: [ '', 
						columns.key, 
						columns.localized,
						columns.path], 
			datatype: 'local',
			data: gridData,
			colModel: colModel,
			localReader: {repeatitems: false},
			shrinkToFit: false,
			width: null,
			rowNum: 99999,
			rowattr: function (rd) {
				return {'class': 'jqgrid-column'};
			},
			beforeSelectRow: function(rowid, e) {
				if (e.target.className.indexOf('del-column') !== -1) {
					alert("Do you want to delete row")
					return false;
				} else {
					return true;
				}
			},
			onSelectRow: function(rowid, celname){
				var row = grid.getLocalRow(rowid);
				defaultTxt.val(row['default']);
				localizedTxt.val(row['localized']);
				selectedRowid = rowid;

				localizedSpan.text(localeMap[row['locale']]);
				localizedB.text(row['locale'].toUpperCase());
			}
		});
	};

	var reset = function() {
		selectedRowid = null;
		defaultTxt.val('');
		localizedTxt.val('');
		localizedSpan.text('');
		localizedB.text('');
	};

	return function (appService, $scope) {
		$scope.$on('FILE_LOADED_EVENT', fileLoadedHandler);

		defaultTxt = $('.default');
		localizedTxt = $('.localized');
		localizedSpan = $('.columnLeft>.localized>span');
		localizedB = $('.columnLeft>.localized>b');

		localizedTxt.keyup(function() {
			if (selectedRowid !== null) {
				grid.setCell(selectedRowid, 'localized', this.value);
			}
		});

		var addButton = $('.add-btn').click(function() {
			var value = filter.val();
			fileMap[value].splice(0, 0, { 'path': value, 'locale': value.split('/')[0] });
			gridData = fileMap[value];
			reset();
			createGrid();
		});

		var filter = $('#filter').change(function() {
			gridData = [];
			if (this.value === 'all') {
				for(var path in fileMap) {
					gridData = gridData.concat(fileMap[path]);
				}
				addButton.attr('disabled', 'disabled');
			} else {
				gridData = gridData.concat(fileMap[this.value]);
				addButton.removeAttr('disabled');
			}
			reset();
			createGrid();
			if (grid.width() !== grid.parent().width()) {
				createGrid();
			}
		});

		var modal = $('#modalDialog'),
			modalBody = modal.on('show.bs.modal', function() {
				var errors = window.Localization.errors,
					body = $(this).html(modalBody);
				body.find('.btn-primary').click(function() {
					var language = body.find('.language').val(),
						fileName = body.find('.fileName').val(),
						copyFrom = body.find('.copyFrom').val();
					if (fileName.trim() === '') {
						return body.find('.error').text(errors.emptyFile).show();
					}
					fileName = language + '/' + fileName + '.json';

					if (fileMap[fileName]) {
						return body.find('.error').text(errors.fileExists).show();
					}

					filter.append($('<option selected></option>').val(fileName).html(fileName));

					if (copyFrom === 'none') {
						gridData = fileMap[fileName] = [];
					} else {
						var data = JSON.parse(JSON.stringify(fileMap[copyFrom]));
						$.each(data, function(index, row) {
							row['localized'] = '';
							row['locale'] = language;
							row['path'] = fileName;
						});
						gridData = fileMap[fileName] = data;
					}
					addButton.removeAttr('disabled');

					reset();
					createGrid();

					modal.modal('hide');
				});
			}).html();

		$.each(modal.find('.language option'), function(index, option) {
			localeMap[option.value] = option.text;
		});

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