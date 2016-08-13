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
			cwd: "web/default/less",
			src: [
              "**/*.less"
            ],
			dest: "dist/css",
			ext: ".css"
          }
        ]
      }
    },
	
	uglify: {
		  marketplace_static: {
			  files: [
				{
				  expand: true,
				  cwd: 'web/isim-static/js',
				  src: ['utils/**/*.js', 'views/**/*.js'],
				  dest: 'dist/js',
				  ext: '.js'
				}
			]
		}
	},
	
	copy: {
		css: {
		  files: [
			  {
				expand: true,
				cwd: 'web/isim-static/css', 
				src: '**/*',
				dest: 'dist/css'
			  }
			]
		},
		
		js: {
		  files: [
			  {
				expand: true,
				cwd: 'web/isim-static/js', 
				src: ['**/*', '!utils/**', '!views/**'],
				dest: 'dist/js'
			  }
			]
		}
	},
  });
  
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  
  grunt.registerTask('default', ['less', 'uglify', 'copy:css', 'copy:js']);
};