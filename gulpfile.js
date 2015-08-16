/**
 * Ref: https://github.com/johnpapa/gulp-patterns
 */

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
  spawn = require('child_process').spawn, // for gulp reload on gulpfile change
  $ = require('gulp-load-plugins')({
    lazy: true
  });

gulp.task('help', $.taskListing);
gulp.task('default', ['help']);

/**
 * @description Remove all files from the lib, dist, and reports folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean', function(done) {
  var delconfig = [].concat(config.js.lib, config.js.dist, config.report);
  log('Cleaning: ' + $.util.colors.blue(delconfig));
  del(delconfig, done);
});

/**
 * @description Remove all styles from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-styles', function(done) {
  var files = [].concat(config.demo + 'css/**/*.css');
  clean(files, done);
});

/**
 * @description Remove all js and html from the build and temp folders
 * @param  {Function} done - callback when complete
 */
gulp.task('clean-code', function(done) {
  var files = [].concat([config.js.dist, config.js.lib]);
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

/**
 * @description Sass to css demo compiling
 * @return {Stream}
 */
gulp.task('styles', function() {
  log('Compiling SASS ==> CSS');
  return gulp.src(config.sass)
    .pipe($.sass())
    .on('error', errorLogger) // more verbose and dupe output. requires emit.
    .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
    .pipe(gulp.dest(config.css))
    .pipe(browserSync.stream());
});

/**
 * @description Triggers sass compiling, used mainly in dev
 */
gulp.task('sass-watcher', function() {
  gulp.watch([config.sass], ['styles']);
});

/**
 * @description Integrates main bower dependencies into the demo js lib folder
 * @return {Stream}
 */
gulp.task('bower', function() {
  var jsFilter = $.filter(['*.js', '*.map']);
  var cssFilter = $.filter(['*.css']);
  var fontsFilter = $.filter(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2', '*.otf']);
  var sources = gulp.src(bowerFiles())
    .pipe($.filter(['*','!*.scss'])) // font remove sass files
    .pipe(jsFilter)
    .pipe(gulp.dest(config.lib))
    .pipe(jsFilter.restore())
    .pipe(cssFilter)
    .pipe(gulp.dest(config.css))
    .pipe(cssFilter.restore())
    .pipe(fontsFilter)
    .pipe(gulp.dest(config.fonts))
    .pipe(fontsFilter.restore());
  return gulp.src(config.index)
      .pipe($.inject(sources, {relative: true, name: 'bower'})).pipe(gulp.dest(config.demo));
});

/**
 * @description Injects css styles and js,js/lib files into main index, used to add new dependecies and releasing
 * @return {Stream}
 */
gulp.task('inject', ['styles','bower','bundle-sim','bundle-app'], function() {
  log('Wiring the bower dependencies, js and css into the html');

  return gulp.src(config.index)
    //.pipe($.inject(gulp.src(config.lib, {read: false})))
    .pipe($.inject(gulp.src([config.lib + config.mainSim,
                            config.lib + config.mainApp], {read: false}), {relative: true, name: 'lib'}))
    .pipe($.inject(gulp.src(config.js.demo, {read: false}), {relative: true, name: 'demo'}))
    .pipe($.inject(gulp.src(config.css + 'demo.css', {read: false}), {relative: true, name: 'demo'}))
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

/**
 * @description Build task to build everything into the demo lib and dist folders, use for releasing
 */
gulp.task('build', ['clean', 'inject'], function() {
  log('Generated bundle');
  // same as dev but without triggering watchify, TODO minification of jss/css
});

/**
 * @description Bundle app code into the demo folder, for use during dev
 */
gulp.task('bundle-app', function(done) {
  log('Building bundle' + config.srcMainApp + ' into ' + config.dist + config.mainApp + ' and ' + config.lib + config.mainApp);
  var b = browserify(config.browserifyApp.opts);
  b.external(config.browserifyExpose);
  return doBrowserify(config.mainApp, b)
    .pipe(gulp.dest(config.dist))
    .pipe(gulp.dest(config.lib));
});

/**
 * @description Bundle sim src code into the demo folder, for use during dev
 */
gulp.task('bundle-sim', function(done) {
  log('Building bundle' + config.srcMainSim + ' into ' + config.dist + config.mainSim + ' and ' + config.lib + config.mainSim);
  var b = browserify(config.browserifySim.opts);
  b.require(config.srcMainSim, {expose: config.browserifyExpose});
  return doBrowserify(config.mainSim, b)
    .pipe(gulp.dest(config.dist))
    .pipe(gulp.dest(config.lib));
});

/**
 * @description Main dev tast to trigger browserify builds on js file changes an sass compile on css changes
 */
gulp.task('dev', ['clean', 'inject'], function() {
  var port = 8080;
  gulp.watch([config.sass], ['styles'])
    .on('change', changeEvent);

  log('Starting BrowserSync on port ' + port);
  var options = {
    //proxy: 'localhost:' + port,
    server: {
      baseDir: './',
      index: config.index,
      routes: {
        '/fonts': config.fonts,
        '/src': config.src,
        '/css': config.css,
        '/img': config.img,
        '/js': config.demo + 'js/',
      }
    },
    port: 3000,
    files: [
      config.demo + '**/*.js',
      config.demo + '**/*.html',
      '!' + config.sass,
      '!' + config.css
    ],
    ghostMode: { // these are the defaults t,f,t,t
      clicks: true,
      location: false,
      forms: true,
      scroll: true
    },
    open: args.noopen ? false : true,
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'crowd-sim',
    notify: true,
    reloadDelay: 1000
  };
  browserSync(options);
  var wSim = watchify(browserify(assign({}, watchify.args, config.browserifySim.opts)));
  wSim.require(config.srcMainSim, {expose: config.browserifyExpose});
  setupWatchify(config.mainSim, wSim);

  var wApp = watchify(browserify(assign({}, watchify.args, config.browserifyApp.opts)));
  wApp.external(config.browserifyExpose);
  setupWatchify(config.mainApp, wApp);
});

/**
 * @description Setups watchify to rebuild bundles on js file changes
 *
 * @param  {String} main    name of the bundle file to create
 * @param  {Object} w       Watchify
 */
function setupWatchify(main, w) {
  w.on('update', function() {
    doBrowserify(main, w)
    .pipe(gulp.dest(config.lib));
    browserSync.notify('reloading ' + main + ' now ...');
    //browserSync.reload();
  }).on('log', $.util.log);
  w.bundle().on('data', function() {});
}

/**
 * @description Bundles given src stream into a pipe
 *
 * @param  {String} filename name of the bundle file to create
 * @param  {Stream} b        bundle stream that contains the src to bunble
 * @return {Stream}          bundle stream result, use in other thats to create multiple copies with gulp.dest
 */
function doBrowserify(filename, b) {
  return b.bundle()
    .on('error', $.util.log.bind($.util, 'Browserify Error'))
    //.pipe($.plumber())
    .pipe(source(filename))
    .pipe(buffer())
    .pipe($.sourcemaps.init({
      loadMaps: true
    })) // loads map from browserify file
    .pipe($.sourcemaps.write('./')); // writes .map file;
}

/**
 * @description Task to restart gulp dev on gulpfile.js, needs testing. Ref: http://noxoc.de/2014/06/25/reload-gulpfile-js-on-change/
 */
gulp.task('dev-gulp', function() {
  var process;

  function restart() {
    log('Restarting gulp');
    if (process) { process.kill(); }
    process = spawn('gulp', ['dev'], {stdio: 'inherit'});
  }
  gulp.watch(__filename, restart);
  restart();
});

/**
 * Log an error message and emit the end of a task
 */
function errorLogger(error) {
  log('*** Start of Error ***');
  log(error);
  log('*** End of Error ***');
  this.emit('end');
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
  del(path,done);
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
