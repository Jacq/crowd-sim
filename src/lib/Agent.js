/* global window,module, exports : true, define */

Agent = function(id, x, y, size) {
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

  this.extra = {};
};

module.exports = Agent;
