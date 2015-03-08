/*
 * Dependencias
 */
var config = require('./gulp.config')(),
  gulp = require('gulp'),
  del = require('del'),
  bowerFiles = require('main-bower-files'),
  server = require('karma').server,
  args = require('yargs').argv,
  browserify = require('browserify'),
  watchify = require('watchify'),
  browserSync = require('browser-sync'),
  assign = require('lodash.assign'),
  source = require('vinyl-source-stream'),
  buffer = require('vinyl-buffer'),
  $ = require('gulp-load-plugins')({
    lazy: true
  });

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/**
 * @description Remove all files from the build, temp, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function(done) {
  var delconfig = [config.dist, config.report];
  log('Cleaning: ' + $.util.colors.blue(delconfig));
  del(delconfig, done);
});

/**
 * @description Remove all styles from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-styles', function(done) {
  var files = [].concat(
      config.demo + 'css/**/*.css'
  );
  clean(files, done);
});

/**
 * @description Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function(done) {
  var files = [].concat(
      config.dist + 'js/**/*.js'
  );
  clean(files, done);
});

/**
 * @description vet the code and create coverage report
 * @return {Stream}
 */
gulp.task('vet', function() {
  var vetsource = [config.js.src, config.js.demo];
  log('Analyzing source with JSHint and JSCS: ' + $.util.colors.blue(vetsource));
  return gulp
      .src(vetsource)
      //.pipe($.plumber())
      .pipe($.if(args.verbose, $.print()))
      .pipe($.jshint())
      .pipe($.jshint.reporter('jshint-stylish', {verbose: true}))
      .pipe($.jshint.reporter('fail'))
      .pipe($.jscs());
});

gulp.task('styles', ['clean-styles'], function() {
  log('Compiling SASS ==> CSS');
  return gulp.src(config.sass)
    .pipe($.sass())
    //.on('error', errorLogger) // more verbose and dupe output. requires emit.
    .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
    .pipe(gulp.dest(config.css));
});

gulp.task('sass-watcher', function() {
  gulp.watch([config.sass], ['styles']);
});

gulp.task('inject', ['styles'], function() {
  log('Wiring the bower dependencies, js and css into the html');

  return gulp
      .src(config.index)
      //.pipe($.inject(gulp.src(config.lib, {read: false})))
      .pipe($.inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower',relative: true}))
      .pipe($.inject(gulp.src(config.js.dist, {read: false}), {relative: true}))
      .pipe($.inject(gulp.src(config.css + 'demo.css', {read: false})))
      //.pipe($.inject(gulp.src(config.js.demo, {read: false}), {name: 'demo'}))
      .pipe(gulp.dest(config.demo));
});

gulp.task('test', function(done) {
  log('Running tests, singleRun=' + !args.dev);
  var options = {
    configFile: __dirname + '/karma.conf.js',
    singleRun: !args.dev,
  };
  server.start(options, done);
});

gulp.task('build', ['bundle-lib', 'bundle-demo'] , function() {
  log('Building lib and demo');
});

gulp.task('bundle-demo', function() {
  log('Building bundle from ' + config.srcMainDemo + ' into ' + config.dist + config.optimized.demo);
  doBrowserify(config.optimized.demo, browserify(config.srcMainDemo))
    .pipe(gulp.dest(config.dist));
});

gulp.task('bundle-lib', function() {
  log('Building bundle from ' + config.srcMainLib + ' into ' + config.dist + config.optimized.lib);
  doBrowserify(config.optimized.lib, browserify(config.srcMainLib))
    .pipe(gulp.dest(config.dist));
});

gulp.task('dev', ['clean', 'build'], function() {
  var port = 8080;
  gulp.watch([config.sass], ['styles'])
    .on('change', changeEvent);
  log('Starting BrowserSync on port ' + port);

  var options = {
      //proxy: 'localhost:' + port,
      server: {
        baseDir: './',
        index: config.index
      },
      port: 3000,
      files: [
          config.demo + '**/*.*',
          config.src + '**/*.*',
          '!' + config.sass
        ],
      ghostMode: { // these are the defaults t,f,t,t
        clicks: true,
        location: false,
        forms: true,
        scroll: true
      },
      injectChanges: true,
      logFileChanges: true,
      logLevel: 'info',
      logPrefix: 'crowd-sim',
      notify: true,
      reloadDelay: 0 //1000
    } ;
  browserSync(options);
  var wLib = setupWatchify(config.optimized.lib, config.watchify.optsLib);
  var wDemo = setupWatchify(config.optimized.demo, config.watchify.optsDemo);

  doBrowserify(config.optimized.lib, wLib);
  doBrowserify(config.optimized.demo, wDemo);
});

function setupWatchify(main, options) {
  var opts = assign({}, watchify.args, options);
  var w = watchify(browserify(opts));
  w.on('update', function() {
    doBrowserify(main, w);
    browserSync.notify('reloading ' + main + ' now ...');
    browserSync.reload();
  });
  w.on('log', $.util.log);
  return w;
}

function doBrowserify(mainFile, b) {
  return b.bundle()
  .on('error', $.util.log.bind($.util, 'Browserify Error'))
  //.pipe($.plumber())
  .pipe(source(mainFile))
  .pipe(buffer())
  .pipe($.sourcemaps.init({loadMaps: true})) // loads map from browserify file
  .pipe($.sourcemaps.write('./')); // writes .map file
}

/**
 * @description When files change, log it
 * @param  {Object} event - event that fired
 */
function changeEvent(event) {
  var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
  log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

/**
 * @description Delete all files in a given path
 * @param  {Array}   path - array of paths to delete
 * @param  {Function} done - callback when complete
 */
function clean(path, done) {
  log('Cleaning: ' + $.util.colors.blue(path));
  del(path, done);
}

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
