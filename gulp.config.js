
module.exports = function() {
  var fs = require('fs');
  var bowerrc = fs.readFileSync('./.bowerrc');
  var src = './src/';
  var dist = './dist/';
  var demo = './demo/';
  var mainLib = 'CrowdSim.js';
  var mainDemo = 'Demo.js';
  var srcMainLib = src + mainLib;
  var srcMainDemo = demo + 'js/' + mainDemo;

  var config = {
  src: src,
  dist: dist,
  demo: demo,
  srcMainLib: srcMainLib,
  srcMainDemo: srcMainDemo,
  sass: demo + 'sass/**/*.scss',
  css: demo + 'css/',
  index: demo + 'index.html',
  js: {
    src: src + '**/*.js',
    demo: demo + 'js/*.js',
    dist: dist + '**/*.js'
  },
  bower: bowerrc,
  optimized: {
    lib: mainLib,
    demo: mainDemo
  },
  report: './report/',
  watchify: {
    optsLib: {
      entries: [srcMainLib],
      debug: true
    },
    optsDemo: {
      entries: [srcMainDemo],
      debug: true
    }
  },
};

  return config;
};
