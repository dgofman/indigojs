'use strict';

module.exports = function (grunt) {
    var SRC = './src';
    var DIST = './dist';
    var TMPL = './templates';
    
    grunt.initConfig({

        clean: {
            jsdoc: {
                src: DIST
            }
        },

        less: {
            dist: {
                src: TMPL + '/less/**/custom.less',
                dest: TMPL + '/static/styles/custom.css'
            }
        },

        jsdoc: {
            dist: {
                src: [SRC + '/**/*.js'],
                options: {
                    destination: DIST,
                    configure: TMPL + '/conf.json',
                    template: TMPL,
                    'private': false
                }
            }
        }
    });

    // Load task libraries
    [
        'grunt-contrib-clean',
        'grunt-contrib-less',
        'grunt-jsdoc'
    ].forEach(function (taskName) {
        grunt.loadNpmTasks(taskName);
    });

    grunt.registerTask('build', 'Create documentations', [
        'clean:jsdoc',
        'less',
        'jsdoc:dist'
    ]);
};
