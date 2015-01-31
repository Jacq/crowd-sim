/* global window,module, exports : true, define */

var Entity = {};

(function() {
  'use strict';

  Entity = function(id, x, y, size, direction) {
    this.id = id;
    this.position = {
      x: x,
      y: y
    };
    this.velocity = {
      x: 0,
      y: 0
    };
    this.acceleration = {
      x: 0,
      y: 0
    };
    this.size = size;
    this.direction = direction;
    this.view = {};
  };

})();
