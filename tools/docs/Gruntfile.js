'use strict';

module.exports = function (grunt) {
    var SRC = '../../';
    var DIST = './dist';
    var TMPL = './node_modules/ink-docstrap/template';
    
    grunt.initConfig({

        clean: {
            jsdoc: {
                src: DIST
            }
        },

        jsdoc: {
            dist: {
                src: [SRC + 'indigo.js', SRC + 'libs/errorHandler.js', SRC + 'libs/middleware.js'],
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

    grunt.registerTask('replace', 'Insert new styles', function() {
        var file = TMPL + '/tmpl/source.tmpl',
            contents = grunt.file.read(file);
        if (contents.indexOf('.navbar-fixed-top') === -1) {
            console.log(contents)
            grunt.file.write(file, contents + 
                '<style>.navbar-fixed-top {position: absolute !important;}</style>');
        }
    });

    grunt.registerTask('default', 'Run tasks', function() {
        grunt.task.run(['doc', 'replace']);
    });
};
