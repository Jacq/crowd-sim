/* global window,module, exports : true, define */

/**
 * @class CrowdSim
 * @main CrowdSim
 * @module CrowdSim
 * @type {Object}
 */
var CrowdSim = {
  Agent: require('./Agent'),
  Entity: require('./Entities/Entity'),
  Context: require('./Entities/Context'),
  Wall: require('./Entities/Wall'),
  Path: require('./Entities/Path'),
  Group: require('./Entities/Group'),
  Joint: require('./Entities/Helpers/Joint'),
  World: require('./World'),
  Engine: require('./Engine'),
  Vec2: require('./Common/Vec2')
};

/**
 * Restarts the generation of entities ids. Usefull when loading new worlds.
 *
 * @method restartIds
 */
CrowdSim.restartIds = function() {
  CrowdSim.Agent.id = 0;
  CrowdSim.Context.id = 0;
  CrowdSim.Group.id = 0;
  CrowdSim.Path.id = 0;
  CrowdSim.Wall.id = 0;
  CrowdSim.Joint.id = 0;
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}
