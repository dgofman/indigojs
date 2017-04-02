'use strict';

var fs = require('fs'),
	cjson = require('cjson');

module.exports = function(grunt) {

	grunt.initConfig({
		less: {
			compileCore: {
				options: {
					strictMath: false,
					compress: true
				},
				files: [
					{
						expand: true,
						cwd: ".{{webdir}}/default/less",
						src: [ "**/*.less" ],
						dest: ".{{webdir}}/static/css",
						ext: ".css"
					}
				]
			}
		},

		uglify: {
				options: {
					sourceMap: true,
					quoteStyle: 3
				},
				static: {
					files: [
					{
						expand: true,
						cwd: '.{{webdir}}/static/js',
						src: ['**/*.js', '!vendor/**'],
						dest: '.{{webdir}}/static/js',
						ext: '.min.js',
						rename: function (dst, src) {
							var file = dst + '/' + src;
							if (fs.existsSync(file)) {
								fs.unlinkSync(file);
							}
							return file;
						}
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('flags', function (key, value) {
		var json = cjson.load('./config/locales.json'),
			content = `@import './constant_flags.less';\n\n${json.cssName} {\n\t.flag();\n`,
			tab = '', tab_append = '';

		if (json.nested) {
			tab = '\t';
			tab_append = '\t&';
		} else {
			content += '}\n';
		}

		json.languages.forEach(function(node) {
			content += `\n${tab_append}.${node.code} {\n\t${tab}.${node.flag}();\n${tab}}\n`;
		});

		if (json.nested) {
			content += '}';
		}

		grunt.file.write('.{{webdir}}/default/less/' + json.outputName, content);
	});

	grunt.registerTask('default', ['flags', 'less', 'uglify']);
};