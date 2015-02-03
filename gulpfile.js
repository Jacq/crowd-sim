/*
 * Dependencias
 */
var gulp = require('gulp'),
 del = require('del'),
 server = require('karma').server,
 args = require('yargs'),
  $ = require('gulp-load-plugins')({
    lazy: true
  });

var  colors = $.util.colors;
var envenv = $.util.env;

var demo = './demo/';
var src = './src/';

var config = {
  src : src,
  demo : demo,
  demo_lib : demo+'js/lib/',
  dist : './dist/',
  js : {
    demo : demo +'js/*.js',
    src : src+'**/*.js',
  },
  optimized :{
    simulator : 'crowd-sim.js',
    minified : 'crowd-sim.min.js'
  },
  report : './report/'
};

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/**
 * Remove all files from the build, temp, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function(done) {
  var delconfig = [config.dist, config.demo_lib, config.report];
  log('Cleaning: ' + $.util.colors.blue(delconfig));
  del(delconfig, done);
});

/**
 * vet the code and create coverage report
 * @return {Stream}
 */
gulp.task('vet', function() {
  var vetsource = [config.js.src, config.js.demo];
  log('Analyzing source with JSHint and JSCS: '+ $.util.colors.blue(vetsource));
  return gulp
      .src(vetsource)
      //.pipe($.plumber())
      .pipe($.if(args.verbose, $.print()))
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
      .pipe($.jshint.reporter('fail'))      
      .pipe($.jscs());
});

gulp.task('test', function(done) {
  console.log(server);
  var options = {
    configFile: __dirname + '/karma.conf.js',
    singleRun: true,
  };
  server.start(options, done);
});

gulp.task('build', ['vet', 'test'], function() {
  return gulp.src(config.jsSimulator)
    .pipe($.concat(config.optimized.simulator))
    .pipe(gulp.dest(config.dist))
    .pipe($.rename(config.optimized.minified))
    .pipe($.uglify())
    .pipe(gulp.dest(config.dist))
    .pipe(gulp.dest(config.demo_lib));
});

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}

/**
 * Show OS level notification using node-notifier
 */
function notify(options) {
  var notifier = require('node-notifier');
  var notifyOptions = {
    sound: 'Bottle',
    contentImage: path.join(__dirname, 'gulp.png'),
    icon: path.join(__dirname, 'gulp.png')
  };
  _.assign(notifyOptions, options);
  notifier.notify(notifyOptions);
}
