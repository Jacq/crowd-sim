(function () {
    'use strict';

    /**
     * My property description.  Like other pieces of your comment blocks,
     * this can span multiple lines.
     *
     * @property propertyName
     * @type {Object}
     * @default "foo"
     */
    var CrowdSim = {};

    var Engine = {
        running: false
    };
    Engine.run = function () {
        this.running = true;
    };
    Engine.stop = function () {
        this.running = false;
    };
    Engine.reset = function () {
        this.running = false;
    };

    CrowdSim.World = {
        entities: [],
        add: function (entity) {
            this.entities.push(entity);
        }
    };

    CrowdSim.Single = function (x, y, size, direction) {
        this.position = {
            x: x,
            y: y
        };
        this.size = size;
        this.direction = direction;
        this.view = {};
    };

    CrowdSim.Engine = Engine;

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