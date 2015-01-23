'use strict';

define([
	'jquery',
	'angular'
], function($) {

	var rootScope,
		grid,
		gridData = [],
		fileMap = {},
		localeMap = {},
		defaultLocale = {},
		defKeys,
		defaultTxt,
		localizedTxt,
		localizedSpan,
		localizedB,
		parentdWidth = 0,
		selectedRowId = null;

	var fileLoadedHandler = function(evt, items) {
		var locale = window.Localization.defaultLocale,
			def = items[locale] || items[locale = locale.split('-')[0]];

		defaultLocale = {'key': locale.toUpperCase(), 'name': localeMap[locale], 'locale': locale};

		rootScope.defaultLocale = defaultLocale;

		gridData = [];

		defKeys = parseGridData(locale, def);
		delete items[locale];

		for (locale in items) {
			parseGridData(locale, items[locale]);
		}

		createGrid();
	};

	var parseGridData = function(locale, items) {
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
								'name': item.name,
								'locale': locale });
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

	var createGrid = function(isReset) {
		if (grid) {
			parentdWidth = grid.parent().width();
			grid.GridUnload();
		}

		if (isReset) {
			reset();
		}

		var deletedRows = [],
			columns = window.Localization.columns || {},
			colModel = [ { width: 24, cellattr: function () {
								return ' class="glyphicon glyphicon-trash del-column"';
							}
						},
						 {name: 'key', index: 'key', width: 300}, 
						 {name: 'localized', index: 'localized', width: parentdWidth - 575 - 1}, //col1 + col2 + col4
						 {name: 'path', index: 'path', width: 250} ];

		$.each(gridData, function(index, row) {
			row.id = index + 1;
			if (defKeys[row.name][row.key] === undefined) {
				deletedRows.push(row.id);
			}
		});

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
			rowattr: function () {
				return {'class': 'jqgrid-column'};
			},
			beforeSelectRow: function(rowid, e) {
				if (e.target.className.indexOf('del-column') !== -1) {
					var selRow = grid.getLocalRow(rowid),
						modal = $('#deletelDialog').modal(),
						checkbox = modal.find('.deleteOther > input');
					modal.find('.deleteOther').toggle(selRow.locale === defaultLocale.locale);

					modal.find('.btn-primary').one('click', function() {
						var deleteRow = function(path) {
							var rows = fileMap[path];
							$.each(rows, function(index, row) {
								if (row.key === selRow.key) {
									fileMap[path].splice(index, 1);
									return false;
								}
							});
						};
						if (selRow.locale === defaultLocale.locale) {
							delete defKeys[selRow.name][selRow.key];

							if (checkbox.is(':checked')) {
								$.each(fileMap, function(path) {
									if (path.split('/')[1] === selRow.name) {
										deleteRow(path);
									}
								});
							} else {
								deleteRow(selRow.path);
							}
						} else {
							deleteRow(selRow.path);
						}

						gridData = fileMap[selRow.path];
						createGrid(true);
						modal.modal('hide');
					});
					return false;
				}
				return true;
			},
			onSelectRow: function(rowid){
				var row = grid.getLocalRow(rowid);
				defaultTxt.val(defKeys[row.name][row.key]);
				localizedTxt.val(row.localized);
				rootScope.selectedRowId = selectedRowId = rowid;
				rootScope.$apply();

				localizedSpan.text(localeMap[row.locale]);
				localizedB.text(row.locale.toUpperCase());
			},
			gridComplete: function () {
				var table = $(this);
				for (var i = 0; i < deletedRows.length; i++) {
					table.find('#' + deletedRows[i] + ' td').css('background-color', 'rgb(252, 196, 196)');
				}
			}
		});
	};

	var createVerify = function() {
		createGrid(true);
		if (grid.width() !== grid.parent().width()) {
			createGrid();
		}
	};

	var reset = function() {
		defaultTxt.val('');
		localizedTxt.val('');
		localizedSpan.text('');
		localizedB.text('');
		rootScope.selectedRowId = selectedRowId = null;
		rootScope.$apply();
	};

	var save = function(saveDialog, $http, pathKeys) {
		var data = {},
			filePath = pathKeys.pop(),
			rows = fileMap[filePath];
		$.each(rows, function(index, row) {
			data[row.key] = row.localized;
		});
		saveDialog.find('.error').hide();
		saveDialog.find('progress').val(100 / (pathKeys.length + 1));

		$http.post('/localization/save', {filePath: filePath, data: data})
			.success(function() {
				if (pathKeys.length > 0) {
					save(saveDialog, $http, pathKeys);
				} else {
					saveDialog.modal('hide');
				}
			})
			.error(function(data) {
				console.error(data);
				saveDialog.find('.error').show().find('p').text(filePath);
				saveDialog.find('.btn-primary').css('visibility', 'visible');
			});
	};

	return function (appService, $rootScope, $scope, $http) {
		rootScope = $rootScope;
		$scope.$on('FILE_LOADED_EVENT', fileLoadedHandler);

		defaultTxt = $('.default');
		localizedTxt = $('.localized');
		localizedSpan = $('.columnLeft>.localized>span');
		localizedB = $('.columnLeft>.localized>b');

		localizedTxt.keyup(function() {
			if (selectedRowId !== null) {
				var row = grid.getLocalRow(selectedRowId);
				grid.setCell(selectedRowId, 'localized', this.value);
				if (defaultLocale.locale === row.locale) {
					defKeys[row.name][row.key] = this.value;
					defaultTxt.val(this.value);
				}
			}
		});

		$rootScope.selectedFile = 'all';

		var filter = $('#filter').change(function() {
			gridData = [];
			$rootScope.selectedFile = this.value;
			$rootScope.$apply();
			if (this.value === 'all') {
				for(var path in fileMap) {
					gridData = gridData.concat(fileMap[path]);
				}
			} else {
				gridData = gridData.concat(fileMap[this.value]);
			}
			createVerify();
		});

		var createlDialog = $('#createlDialog'),
			createModalBody = createlDialog.on('show.bs.modal', function() {
				var errors = window.Localization.errors,
					body = $(this).html(createModalBody),
					copyFrom = body.find('.copyFrom'),
					fileInput = body.find('.fileName');
				fileInput.val(copyFrom.val().split('/')[1].replace('.json', ''));
				copyFrom.change(function() {
					fileInput.val(this.value.split('/')[1].replace('.json', ''));
				});
				body.find('.btn-primary').click(function() {
					var language = body.find('.language').val(),
						fileName = fileInput.val() + '.json',
						fullName = language + '/' + fileName;
					if (fileInput.val().trim() === '') {
						return body.find('.error').text(errors.emptyFile).show();
					}

					if (fileMap[fullName]) {
						return body.find('.error').text(errors.fileExists).show();
					}

					filter.append($('<option selected></option>').val(fullName).html(fullName));

					var data = JSON.parse(JSON.stringify(fileMap[copyFrom.val()]));
					$.each(data, function(index, row) {
						row['localized'] = '';
						row['locale'] = language;
						row['path'] = fullName;
					});
					gridData = fileMap[fullName] = data;
					if (!defKeys[fileName]) {
						defKeys[fileName] = {};
					}

					createVerify();
					createlDialog.modal('hide');
				});
			}).html();

		$.each(createlDialog.find('.language option'), function(index, option) {
			localeMap[option.value] = option.text;
		});

		var newModal = $('#newRowDialog'),
			newModalBody = newModal.on('show.bs.modal', function() {
				var body = $(this).html(newModalBody);
				body.find('.btn-primary').click(function() {
					var newKey = body.find('.langKey').val().trim(),
						fileName = filter.val(),
						rows = fileMap[fileName],
						arr1 = fileName.split('/');
					for (var i = 0; i < rows.length; i++) {
						if (rows[i].key === newKey) {
							body.find('.error').show();
							return;
						}
					}

					$.each(fileMap, function(fileName, rows) {
						var arr2 = fileName.split('/');
						if (arr1[1] === arr2[1]) {
							rows.splice(0, 0, { 'key': newKey, 'path': fileName, 'name': arr2[1], 'locale': arr2[0] });
						}
					});

					if (defKeys[arr1[1]]) {
						defKeys[arr1[1]][newKey] = '';
					}

					gridData = rows;
					createGrid(true);

					newModal.modal('hide');
				});
			}).html();

		createGrid();

		var saveDialog = $('#saveDialog').on('show.bs.modal', function() {
			saveDialog.find('.btn-primary').css('visibility', 'hidden');
			saveDialog.find('progress').val(0);

			var pathKeys = [];
			$.each(fileMap, function(filePath) {
				pathKeys.push(filePath);
			});
			save(saveDialog, $http, pathKeys);
		});

		var win = $(window).bind('resize', function() {
			if (grid.parent().width() === 0) {
				setTimeout(function() { win.trigger('resize'); }, 100);
			} else if (grid.parent().width() !== parentdWidth) {
				createGrid();
			}
		}).trigger('resize');
	};
});