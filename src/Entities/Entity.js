var Vec2 = require('../Common/Vec2');

var Entity = function(x, y, parent) {
  this.extra = {}; // for extra informatin, e.g. render object
  this.pos = Vec2.fromValues(x, y);
  this.parent = parent;
  this.entities = {}; // children entities
  this.view = null; // to store references to render objects
  this.parent.addEntity(this);
};

Entity.prototype.updatePos = function(x, y) {
  this.pos[0] = x;
  this.pos[1] = y;
};

Entity.prototype.destroy = function() {
  this.world.removeEntity(this);
};

module.exports = Entity;
