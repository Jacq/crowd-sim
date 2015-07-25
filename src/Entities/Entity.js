var Vec2 = require('../Common/Vec2');

var Entity = function(x, y, parent) {
  this.extra = {}; // for extra information, e.g. render object
  this.pos = Vec2.fromValues(x, y);
  this.entities = {}; // stores diferent structures with children entities
  this.view = null; // to store references to render objects
  if (parent) {
    this.parent = parent;
    // request add to parent the entity
    this.parent.addEntity(this);
  }
};

Entity.prototype.destroy = function() {
  if (parent) {
    // request to parent removal of entity
    this.parent.removeEntity(this);
  }
};

Entity.prototype.updatePos = function(x, y) {
  this.pos[0] = x;
  this.pos[1] = y;
};

// To add a children entity
Entity.prototype.addEntity = function(joint) {};

// To request remove of a children entity
Entity.prototype.removeEntity = function(joint) {};

module.exports = Entity;
