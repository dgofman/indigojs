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
                src: [SRC + 'indigo.js', SRC + 'libs/errorHandler.js', SRC + 'libs/middleware.js', SRC + 'README.md'],
                options: {
                    destination: DIST,
                    configure: './conf.json',
                    template: TMPL,
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

    grunt.registerTask('doc', 'Create documentations', [
        'clean:jsdoc',
        'jsdoc:dist',
    ]);

    grunt.registerTask('default', 'Run tasks', function() {
        grunt.task.run(['doc']);
    });
};
