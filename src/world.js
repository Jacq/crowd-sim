/* global window,module, exports : true, define */

var World = {};
(function() {
  'use strict';

  World = function(w, h) {
    this.entities = [];
    this.wrap = true;
    this.MAX_X = w;
    this.MIN_X = 0;
    this.MAX_Y = h;
    this.MIN_Y = 0;
  };

  World.prototype.add = function(entity) {
    this.entities.push(entity);
  };
  World.prototype.save = function() {
    this.entitiesSave = JSON.stringify(this.entities);
  };
  World.prototype.restore = function() {
    this.entities = JSON.parse(this.entitiesSave);
  };

})();
