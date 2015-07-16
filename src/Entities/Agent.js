'use strict';

var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');

var Agent = function(x, y, group, options) {
  var that = this;
  Entity.call(this, x, y);
  this.id = Agent.id++;

  Lazy(options).defaults(Agent.defaults).each(function(v, k) {
    that[k] = v;
  });
  this.group = group;
  this.vel = Vec2.create();
  this.behavior = null; // function set by group
  if (this.debug) {
    this.debug = {};
  }
};

Agent.prototype.getRadius = function() {
  return this.radius;
};

Agent.prototype.followGroupPath = function(index) {
  var path = this.group.getPath();
  if (path) {
    var wps = path.getWaypoints();
    this.target = wps[index || 0];
    this.pathNextIdx = 1;
  } else {
    this.target = null;
    this.pathNextIdx = 0;
  }
};

Agent.prototype.step = function(stepSize) {
  var path = this.group.getPath();
  var wps = path ? path.getWaypoints() : null;

  var accel = this.group.behavior.getAccel(this, this.target);

  if (this.debug) {
    if (accel && (isNaN(accel[0]) || isNaN(accel[1]))) {
      throw 'Agent pos invalid';
    }
  }

  this.move(accel, stepSize);
  // update target to next if arrive at current
  if (this.target) {
    var distToTarget = Vec2.distance(this.pos, this.target.pos);
    if (distToTarget < this.target.getRadius()) {
      if (this.pathNextIdx < path.length) {
        // follow to next waypoint
        this.target = path[this.pathNextIdx++];
      } else {
        // arrived at last!
        this.pathNextIdx = null;
        this.target = null;
      }
    }
  }
};

Agent.prototype.move = function(accel, stepSize) {
  /*if (Vec2.length(accel) > this.maxAccel) {
    Vec2.normalizeAndScale(accel, accel, this.maxAccel);
  }*/
  Vec2.scaleAndAdd(this.vel, this.vel, accel, stepSize);

  if (Vec2.length(this.vel) > this.maxVel) {
    Vec2.normalizeAndScale(this.vel, this.vel, this.maxVel);
  }

  Vec2.scaleAndAdd(this.pos, this.pos, this.vel, stepSize * this.mobility);
};

Agent.defaults = {
  debug: false,
  size: 0.5,
  mass: 80e3,
  mobility: 1.0,
  maxAccel: 0.5, // m/s^2
  maxVel: 1 // m/seg
};
Agent.id = 0;
Agent.type = 'agent';

module.exports = Agent;
