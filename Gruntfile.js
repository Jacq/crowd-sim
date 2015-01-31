// reference: https://github.com/liabru/matter-js/blob/master/Gruntfile.js
'use strict';
module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        buildName: 'crowd-sim',
        buildVersion: '<%= pkg.version %>-edge',
        docVersion: 'v<%= pkg.version %>',
        concat: {
            build: {
                options: {
                    process: function (src, filepath) {
                        return '// Begin ' + filepath + '\n\n' + src + '\n\n;   // End ' + filepath + '\n\n';
                    }
                },
                src: ['src/**/*.js', '!src/module/*'],
                dest: 'dist/<%= buildName %>.js'
            },
            pack: {
                options: {
                    banner: '/**\n* <%= buildName %>.js <%= buildVersion %> <%= grunt.template.today("yyyy-mm-dd") %>\n* <%= pkg.homepage %>\n* License: <%= pkg.license %>\n*/\n\n'
                },
                src: ['src/module/Intro.js', 'dist/<%= buildName %>.js', 'src/module/Outro.js'],
                dest: 'dist/<%= buildName %>.js'
            }
        },
        uglify: {
            min: {
                options: {
                    banner: '/**\n* <%= buildName %>.min.js <%= buildVersion %> <%= grunt.template.today("yyyy-mm-dd") %>\n* <%= pkg.homepage %>\n* License: <%= pkg.license %>\n*/\n\n'
                },
                src: 'dist/<%= buildName %>.js',
                dest: 'dist/<%= buildName %>.min.js'
            },
            dev: {
                options: {
                    mangle: false,
                    compress: false,
                    preserveComments: false,
                    beautify: {
                        width: 32000,
                        indent_level: 2,
                        space_colon: false,
                        beautify: true
                    },
                    banner: '/**\n* <%= buildName %>.min.js <%= buildVersion %> <%= grunt.template.today("yyyy-mm-dd") %>\n* <%= pkg.homepage %>\n* License: <%= pkg.license %>\n*/\n\n'
                },
                src: 'dist/<%= buildName %>.js',
                dest: 'dist/<%= buildName %>.js'
            }
        },
        copy: {
            demo: {
                src: 'dist/<%= buildName %>.js',
                dest: 'demo/js/lib/<%= buildName %>.js'
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: ['src/**/*.js', 'demo/js/*.js', '!src/module/*']
        },
        connect: {
            watch: {
                options: {
                    port: 5000,
                    open: 'http://localhost:5000/demo',
                    livereload: 9001
                }
            }
        },
        watch: {
            options: {
                livereload: {
                    port: 9001
                }
            },
            src: {
                files: ['src/**/*.js'],
                tasks: ['build:dev']
            },
            demo: {
                files: ['dist/crowd-sim.js', 'demo/js/**/*.html', 'demo/js/**/*.js', 'demo/css/**/*.css']
            }
        },
        yuidoc: {
            compile: {
                name: '<%= pkg.name %>.js Crowd Simulator API Documentation for <%= docVersion %>',
                description: '<%= pkg.description %>',
                version: '<%= docVersion %>',
                url: '<%= pkg.homepage %>',
                options: {
                    paths: 'src',
                    themedir: 'crowd-sim-doc-theme',
                    outdir: 'doc',
                    linkNatives: true
                }
            }
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js',
                backkground: true
            },
            travis: {
                configFile: 'karma.conf.js',
                singleRun: true,
                browsers: ['PhantomJS']
            },
            build: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-yuidoc');
    grunt.loadNpmTasks('grunt-karma');

    grunt.registerTask('default', ['jshint', 'karma:build', 'build', 'doc']);
    grunt.registerTask('test', ['jshint', 'karma:travis']);
    //grunt.registerTask('dev', ['build:dev', 'connect:watch', 'watch']);
    grunt.registerTask('dev', ['karma:unit', 'watch']);
    //grunt.registerTask('test', ['karma:travis']);

    grunt.registerTask('build', function (mode) {
        var isDev = (mode === 'dev'),
            isRelease = (mode === 'release'),
            isEdge = (mode === 'edge'),
            pkg = grunt.file.readJSON('package.json'),
            uglifyTask;

        // development build mode
        if (isDev) {
            grunt.config.set('buildName', 'crowd-sim-dev');
            grunt.config.set('buildVersion', pkg.version + '-dev');
            grunt.task.run('concat', 'uglify:dev', 'uglify:min', 'copy');
        }

        // release build mode
        if (isRelease) {
            grunt.config.set('buildName', 'crowd-sim-' + pkg.version);
            grunt.config.set('buildVersion', pkg.version + '-alpha');
            grunt.task.run('concat', 'uglify:min', 'copy');
        }

        // edge build mode (default)
        if (isEdge || (!isDev && !isRelease)) {
            grunt.config.set('buildVersion', pkg.version + '-edge');
            grunt.task.run('concat', 'uglify:min');
        }
    });

    grunt.registerTask('doc', function (mode) {
        var isDev = (mode === 'dev'),
            isRelease = (mode === 'release'),
            isEdge = (mode === 'edge');

        if (isEdge) {
            grunt.config.set('docVersion', 'edge version (master)');
        }

        grunt.task.run('yuidoc');
    });

    grunt.registerTask('set_config', 'Set a config property.', function (name, val) {
        grunt.config.set(name, val);
    });
};