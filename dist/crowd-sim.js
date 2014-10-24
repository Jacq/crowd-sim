/**
* crowd-sim.js 0.1.2-edge 2014-10-24
* 
* License: 
*/

// Begin src/core.js

(function () {
    'use strict';

    var CrowdSim = {};


    CrowdSim.World = Word;

    // CommonJS module
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = CrowdSim;
        }
        exports.CrowdSim = CrowdSim;
    }

    // AMD module
    if (typeof define === 'function' && define.amd) {
        define('CrowdSim', [], function () {
            return CrowdSim;
        });
    }

    // browser
    if (typeof window === 'object' && typeof window.document === 'object') {
        window.CrowdSim = CrowdSim;
    }

})();

;   // End src/core.js

