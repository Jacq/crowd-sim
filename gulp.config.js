
module.exports = function() {
  var fs = require('fs');
  var bowerrc = fs.readFileSync('./.bowerrc');
  var src = './src/';
  var dist = './dist/';
  var demo = './demo/';
  var main = 'CrowdSim.js';
  var srcMain = src + main;

  var config = {
  src: src,
  dist: dist,
  demo: demo,
  main: main,
  srcMain: srcMain,
  sass: demo + 'sass/**/*.scss',
  css: demo + 'css/',
  fonts: demo + 'fonts/',
  img: demo + 'img/',
  index: demo + 'index.html',
  lib: demo + 'js/lib/',
  js: {
    src: src + '**/*.js',
    demo: demo + 'js/*.js',
    lib: demo + 'js/lib/*.js',
    dist: dist + 'js/**/*.js'
  },
  bower: bowerrc,
  report: './report/',
  browserify: {
    opts: {
      entries: [srcMain],
      debug: true
    },
  },
};

  return config;
};
