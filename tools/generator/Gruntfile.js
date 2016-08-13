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
	
	grunt.registerTask('default', ['less', 'uglify']);
};