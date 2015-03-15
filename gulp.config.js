
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
  index: demo + 'index.html',
  js: {
    src: src + '**/*.js',
    demo: demo + 'js/*.js',
    dist: dist + '**/*.js'
  },
  bower: bowerrc,
  report: './report/',
  watchify: {
    opts: {
      entries: [srcMain],
      debug: true
    },
  },
};

  return config;
};
