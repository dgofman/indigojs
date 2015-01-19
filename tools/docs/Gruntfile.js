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
                src: [SRC + 'README.md', SRC + 'indigo.js', SRC + 'libs/**/*'],
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

    grunt.registerTask('copy', 'Copy sourceloader', function() {
        grunt.file.copy('./sourceloader.html', DIST + '/sourceloader.html');
    });

    grunt.registerTask('default', 'Run tasks', function() {
        process.env.projectVersion = require('../../package.json').version;
        grunt.task.run(['doc', 'copy']);
    });
};
