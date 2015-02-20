/* global window,module, exports : true, define */

module.exports = CrowdSim;

var CrowdSim = module.exports =  {
  Entity: require('./Entity'),
  World: require('./World'),
  Engine: require('./Engine')
};

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}
