var Vec2 = require('../Common/Vec2');

var Entity = function(x, y, world) {
  this.extra = {};
  this.pos = Vec2.fromValues(x, y);
  this.world = world;
};

module.exports = Entity;
