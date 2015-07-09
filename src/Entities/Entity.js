var Vec2 = require('../Common/Vec2');

var Entity = function(x, y, world) {
  this.extra = {};
  this.pos = Vec2.fromValues(x, y);
  this.world = world;
};

Entity.prototype.updatePos = function(x, y) {
  this.pos[0] = x;
  this.pos[1] = y;
};

module.exports = Entity;
