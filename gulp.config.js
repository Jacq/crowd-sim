
module.exports = function() {
  var fs = require('fs');
  var bowerrc = fs.readFileSync('./.bowerrc');
  var src = './src/';
  var srcApp = src + 'app/';
  var srcSim = src + 'sim/';
  var dist = './dist/';
  var demo = './demo/';
  var mainSim = 'CrowdSim.js';
  var mainApp = 'CrowdSimApp.js';
  var srcMainSim = srcSim + mainSim;
  var srcMainApp = srcApp + mainApp;

  var config = {
  src: src,
  srcApp: srcApp,
  srcSim: srcSim,
  dist: dist,
  demo: demo,
  mainSim: mainSim,
  mainApp: mainApp,
  srcMainSim: srcMainSim,
  srcMainApp: srcMainApp,
  sass: demo + 'sass/**/*.scss',
  css: demo + 'css/',
  fonts: demo + 'fonts/',
  img: demo + 'img/',
  index: demo + 'index.html',
  lib: demo + 'js/lib/',
  js: {
    src: src + '**/*.js',
    demo: demo + 'js/*.js',
    lib: demo + 'js/lib/*.*',
    dist: dist + '*.*'
  },
  bower: bowerrc,
  doc: './doc',
  report: './report/',
  browserifySim: {
    opts: {
      paths: [srcSim],
      entries: [srcMainSim],
      debug: true
    }
  },
  browserifyApp: {
    opts: {
      paths: [srcApp],
      entries: [srcMainApp],
      debug: true
    },
    browserifyExternal: 'CrowdSim'
  },
  browserifyExpose: mainSim.substring(0,mainSim.indexOf('.')) // to avoid CrowdSim lib being bundle into CrowdSimApp
};

  return config;
};
