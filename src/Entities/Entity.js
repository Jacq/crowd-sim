var Vec2 = require('../Common/Vec2');

var Entity = function(x, y, world) {
  this.extra = {}; // for extra informatin, e.g. render object
  this.pos = Vec2.fromValues(x, y);
  this.world = world;
  this.entities = {}; // children entities
};

Entity.prototype.updatePos = function(x, y) {
  this.pos[0] = x;
  this.pos[1] = y;
};

module.exports = Entity;
