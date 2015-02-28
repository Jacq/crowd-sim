/* global window,module, exports : true, define */

var CrowdSim = {
  Entity: require('./Entity'),
  World: require('./World'),
  Engine: require('./Engine')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}
