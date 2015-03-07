/*
 * Dependencias
 */
var gulp = require('gulp'),
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

var colors = $.util.colors;
var envenv = $.util.env;

var src = './src/';
var dist = './dist/';
var distDemo = dist + 'demo/';

var demo = src + 'demo/';
var lib = src + 'lib/';

var mainDemo = demo + 'js/Demo.js';
var mainLib = lib + 'CrowdSim.js';

var config = {
  demo: demo,
  lib: lib,
  dist: dist,
  distDemo: distDemo,
  distLib: dist + 'lib/',
  mainDemo: mainDemo,
  mainLib: mainLib,
  images: demo + 'img/**/*.*',
  sass: demo + 'sass/**/*.scss',
  css: distDemo + 'css/',
  index: demo + 'index.html',
  js: {
    demo: demo + 'js/*.js',
    lib: lib + '**/*.js',
  },
  optimized: {
    demo: 'Demo.js',
    lib: 'CrowdSim.js',
    vendor: 'Vendor.js'
  },
  report: './report/',
  watchify: {
    opts: {
      entries: [mainDemo],
      debug: true
    }
  },
  wiredep: {
    json: require('./bower.json'),
    directory: './bower_components',
    ignorePath: '../..'
  }
};

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
      config.distDemo + 'css/**/*.css'
  );
  clean(files, done);
});

/**
 * @description Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function(done) {
  var files = [].concat(
      config.distLib + 'js/**/*.js',
      config.distDemo + 'js/**/*.js',
      config.distDemo + '**/*.html'
  );
  clean(files, done);
});

/**
 * @description Remove all images from the build folder
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-images', function(done) {
  clean(config.distDemo + 'images/**/*.*', done);
});

/**
 * @description vet the code and create coverage report
 * @return {Stream}
 */
gulp.task('vet', function() {
  var vetsource = [config.js.lib, config.js.demo];
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

/**
 * @description Copy images
 * @return {Stream}
 */
gulp.task('images', ['clean-images'], function() {
  log('Copying images');
  return gulp
      .src(config.images)
      .pipe(gulp.dest(config.distDemo + 'images'));
});

gulp.task('sass-watcher', function() {
  gulp.watch([config.sass], ['styles']);
});

gulp.task('wiredep', function() {
  log('Wiring the bower dependencies into the html');
  var wiredep = require('wiredep').stream;

  return gulp
      .src(config.index)
      //.pipe(wiredep(config.wiredep))
      //.pipe($.inject(gulp.src(config.lib, {read: false})))
      .pipe($.inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}))
      .pipe($.inject(gulp.src(config.js.lib, {read: false}), {name: 'lib'}))
      .pipe($.inject(gulp.src(config.js.demo, {read: false}), {name: 'demo'}))
      .pipe(gulp.dest(config.demo));
});

gulp.task('inject', ['wiredep', 'styles'], function() {
  log('Wire up css into the html, after files are ready');
  return gulp
      .src(config.index)
      .pipe($.inject(gulp.src(config.css + 'demo.css', {read: false})))
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

var opts = assign({}, watchify.args, config.watchify.opts);
var w = watchify(browserify(opts));
w.on('update', function() {
  doBrowserify(config.optimized.demo,w);
  browserSync.notify('reloading now ...');
  browserSync.reload();
});
w.on('log', $.util.log);

gulp.task('build', ['clean', 'vet', 'test', 'build-demo'], function(done) {
  done();
});

gulp.task('build-demo', ['inject', 'images', 'styles', 'build-lib'], function() {
  log('Building demo from ' + config.mainDemo);
  var assets = $.useref.assets({searchPath: './'});
  // Filters are named for the gulp-useref path
  var cssDemoFilter = $.filter('**/demo.css');
  var cssVendorFilter = $.filter('**/vendor.css');
  var jsDemoFilter = $.filter('**/' + config.optimized.demo);
  var jsLibFilter = $.filter('**/' + config.optimized.lib);
  var jsVendorFilter = $.filter('**/' + config.optimized.vendor);

  doBrowserify(config.optimized.demo,browserify(config.mainDemo))
      .pipe(gulp.dest(config.distDemo + 'js/'));

  return gulp
    .src(config.index)
    .pipe($.plumber())
    .pipe(assets) // Gather all assets from the html with useref

    // Get the css
    .pipe(cssDemoFilter)
    .pipe($.csso())
    .pipe(cssDemoFilter.restore())
    .pipe(cssVendorFilter)
    .pipe($.csso())
    .pipe(cssVendorFilter.restore())
    /*
    // Get the demo javascript
    .pipe(jsDemoFilter)
    //.pipe($.uglify())
    .pipe(jsDemoFilter.restore)
    // Get the custom javascript
    .pipe(jsLibFilter)
    //.pipe($.uglify())
    .pipe(jsLibFilter.restore)*/
    // Get the vendor javascript
    .pipe(jsVendorFilter)
    .pipe($.uglify()) // another option is to override wiredep to use min files
    .pipe(jsVendorFilter.restore())
    // Apply the concat and file replacement with useref
    .pipe(assets.restore())
    .pipe($.useref())
    .pipe(gulp.dest(config.distDemo));
});

gulp.task('build-lib', function() {
  log('Building lib from ' + config.mainLib);
  return doBrowserify(config.optimized.lib,browserify(config.mainLib))
    //.pipe($.uglify())
    .pipe(gulp.dest(config.distDemo + 'js/'))
    .pipe(gulp.dest(config.distLib));
});

gulp.task('dev', ['clean','build-demo'], function() {
  var port = 8080;
  gulp.watch([config.sass], ['styles'])
    .on('change', changeEvent);
  log('Starting BrowserSync on port ' + port);
  var options = {
      //proxy: 'localhost:' + port,
      server: {
        baseDir: config.distDemo
      },
      port: 3000,
      files: [
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
      logLevel: 'debug',
      logPrefix: 'crowd-sim',
      notify: true,
      reloadDelay: 0 //1000
    } ;
  browserSync(options);
  doBrowserify(w);
});

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
