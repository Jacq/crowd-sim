/* global window,module, exports : true, define */
var Entity = require('./Entity');

var Agent = function(group, x, y, size) {
  Entity.call(this);

  this.id = Agent.id++;
  this.group = group;
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

Agent.prototype.step = function(step) {
  this.group.behavior(this, step);
};
Agent.id = 0;

module.exports = Agent;
