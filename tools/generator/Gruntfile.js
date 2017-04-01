'use strict';

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
				static: {
					files: [
					{
						expand: true,
						cwd: '.{{webdir}}/static/js',
						src: ['**/*.js', '!vendor/**'],
						dest: '.{{webdir}}/static/js',
						ext: '.min.js'
					}
				]
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-uglify');

	grunt.registerTask('flags', function (key, value) {
		var json = require('cjson').load('./config/locales.json'),
			content = `@import './constant_flags.less';\n\n${json.cssName} {\n\t.flag();\n}`;

		json.languages.forEach(function(node) {
			content += `\n.${node.code} {\n\t.${node.code}();\n}\n`;
		});

		grunt.file.write('.{{webdir}}/default/less/' + json.outputName, content);
	});

	grunt.registerTask('default', ['less', 'uglify', 'flags']);
};