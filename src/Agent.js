/* global window,module, exports : true, define */
var Entity = require('./Entity');

var Agent = function(x, y, size) {
  Entity.call(this);

  this.id = Agent.id++;
  this.pos = {
    x: x,
    y: y
  };
  this.vel = {
    x: 0,
    y: 0
  };
  this.size = size;
  this.waypoint = null;
};

Agent.prototype.step = function(world, step) {
  if (this.waypoint) { // move by waypoint

  }
  var accel = {x: Math.random() * 2 - 1, y: Math.random() * 2 - 1};
  this.vel.x += accel.x * step;
  this.vel.y += accel.y * step;
  //this.direction = Math.atan2(entity.vel.y, entity.vel.x);
  this.pos.x += this.vel.x * step;
  this.pos.y += this.vel.y * step;

  if (world.wrap) {
    if (this.pos.x > world.MAX_X) {
      this.pos.x = world.MIN_X + this.pos.x - world.MAX_X;
    }
    if (this.pos.x < world.MIN_X) {
      this.pos.x = world.MAX_X - (world.MIN_X - entity.pos.x);
    }
    if (this.pos.y > world.MAX_Y) {
      this.pos.y = world.MIN_Y + entity.pos.y - world.MAX_Y;
    }
    if (this.pos.y < world.MIN_Y) {
      this.pos.y = world.MAX_Y - (world.MIN_Y - entity.pos.y);
    }
  }
};
Agent.id = 0;

module.exports = Agent;
