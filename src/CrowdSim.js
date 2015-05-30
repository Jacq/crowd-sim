/* global window,module, exports : true, define */

var CrowdSim = {
  Context: require('./Context'),
  Agent: require('./Agent'),
  Group: require('./Group'),
  World: require('./World'),
  Wall: require('./Wall'),
  Path: require('./Path'),
  Engine: require('./Engine'),
  Render: require('./Render/Render')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}
