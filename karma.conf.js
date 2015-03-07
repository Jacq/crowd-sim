
var bowerFiles = require('main-bower-files')();
var wiredep = require('wiredep');
//var bowerFiles = wiredep({devDependencies: true}).js;

module.exports = function(config) {
  'use strict';
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '.',

    // frameworks to use
    frameworks: ['browserify', 'jasmine'],

    // list of files / patterns to load in the browser
    files: [].concat(
        bowerFiles,
        'src/**/*.js',
        'test/**/*Spec.js'
    ),

    // list of files to exclude
    exclude: [
    ],

    // test results reporter to use
    reporters: ['progress', 'brackets', 'html'],
    htmlReporter: {
      outputFile: 'test/units.html'
    },
    //reporters: ['progress'],
    preprocessors: {
      'src/**/*.js': ['browserify'],
      'test/**/*Spec.js': ['browserify']
    },

    // web server port
    port: 9876,
    runnerPort: 9100,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers
    browsers: ['PhantomJS'],
    //browsers: ['Chrome', 'PhantomJS'],

    plugins: [
        'karma-browserify',
        'karma-junit-reporter',
        'karma-chrome-launcher',
        'karma-firefox-launcher',
        'karma-phantomjs-launcher',
        'karma-jasmine',
        'karma-brackets',
        'karma-htmlfile-reporter'
        ],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 10000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: false,

    // browserify configuration
    browserify: {
      debug: true,
      watch: false,
      //transform: ['brfs', 'browserify-shim']
    }
  });
};
