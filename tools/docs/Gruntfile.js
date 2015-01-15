'use strict';

module.exports = function (grunt) {
    var SRC = '../../';
    var DIST = './dist';
    var TMPL = './templates';
    
    grunt.initConfig({

        clean: {
            jsdoc: {
                src: DIST
            }
        },

        jsdoc: {
            dist: {
                src: [SRC + 'indigo.js', SRC + 'libs/**/*.js'],
                options: {
                    destination: DIST,
                    configure: './conf.json',
                    template: './node_modules/ink-docstrap/template',
                    'private': false
                }
            }
        }
    });

    // Load task libraries
    [
        'grunt-contrib-clean',
        'grunt-jsdoc'
    ].forEach(function (taskName) {
        grunt.loadNpmTasks(taskName);
    });

    grunt.registerTask('default', 'Create documentations', [
        'clean:jsdoc',
        'jsdoc:dist'
    ]);
};
