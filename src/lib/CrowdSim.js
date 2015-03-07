/* global window,module, exports : true, define */

var CrowdSim = {
  Agent: require('./Agent'),
  Group: require('./Group'),
  World: require('./World'),
  Engine: require('./Engine')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}
