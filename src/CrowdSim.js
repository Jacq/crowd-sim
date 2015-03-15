/* global window,module, exports : true, define */

var CrowdSim = {
  Agent: require('./Agent'),
  Group: require('./Group'),
  World: require('./World'),
  Wall: require('./Wall'),
  Engine: require('./Engine'),
  Render: require('./Render')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}
