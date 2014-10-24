/**
* crowd-sim-dev.min.js 0.1.2-dev 2014-10-24
* 
* License: 
*/

(function() {
  "use strict";
  var CrowdSim = {};
  CrowdSim.World = Word;
  if (typeof exports !== "undefined") {
    if (typeof module !== "undefined" && module.exports) {
      exports = module.exports = CrowdSim;
    }
    exports.CrowdSim = CrowdSim;
  }
  if (typeof define === "function" && define.amd) {
    define("CrowdSim", [], function() {
      return CrowdSim;
    });
  }
  if (typeof window === "object" && typeof window.document === "object") {
    window.CrowdSim = CrowdSim;
  }
})();

