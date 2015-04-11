/* global window,module, exports : true, define */
var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Agent = function(group, x, y, size) {
  Entity.call(this);

  this.id = Agent.id++;
  this.group = group;
  this.pos = Vec2.fromValues(x,y);
  this.vel = Vec2.create();
  this.size = size;
  this.mobility = 1.0;
  this.behaviour = null; // individual dataset by group
};

Agent.prototype.step = function(step) {
  this.group.behavior(this, step);
};
Agent.id = 0;

module.exports = Agent;
