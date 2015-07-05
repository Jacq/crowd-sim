/* global window,module, exports : true, define */

var CrowdSim = {
  Entity: require('./Entities/Entity'),
  Agent: require('./Entities/Agent'),
  Context: require('./Entities/Context'),
  Wall: require('./Entities/Wall'),
  Path: require('./Entities/Path'),
  Group: require('./Behavior/Group'),
  World: require('./World'),
  Engine: require('./Engine'),
  Render: require('./Render/Render')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}
