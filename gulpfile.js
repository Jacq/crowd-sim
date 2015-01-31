/*
 * Dependencias
 */
var gulp = require('gulp'),
  server = require('karma').server,
  yargs = require('yargs'),
  $ = require('gulp-load-plugins')({
    lazy: true
  });

gulp.task('default', ['jslint', 'test']);

gulp.task('jslint', function() {
  return gulp.src(['src/**/*.js', 'demo/js/*.js', '!src/module/*'])
    .pipe($.jshint())
    .pipe($.jscs())
    .pipe($.jshint.reporter('default'));
});

gulp.task('test', function(done) {
  console.log(server);
  var options={
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  };
  server.start(options, done);
});

gulp.task('build', ['jslint'], function() {
  return gulp.src(['src/**/*.js', '!src/module/*'])
    .pipe($.concat('crowd-sim.js'))
    .pipe(gulp.dest('dist'))
    .pipe($.rename('crowd-sim.min.js'))
    .pipe($.uglify())
    .pipe(gulp.dest('dist'))
    .pipe(gulp.dest('demo'));
});
