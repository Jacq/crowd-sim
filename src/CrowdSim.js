/* global window,module, exports : true, define */

var CrowdSim = {
  Agent: require('./Entities/Agent'),
  Context: require('./Entities/Context'),
  Group: require('./Entities/Group'),
  Wall: require('./Entities/Wall'),
  Path: require('./Entities/Path'),
  World: require('./World'),
  Engine: require('./Engine'),
  Render: require('./Render/Render')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}
