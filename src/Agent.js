'use strict';

var Vec2 = require('./Common/Vec2');

var Agent = function(x, y, group, options) {
  var that = this;
  this.id = Agent.id++;
  // merge options with agent
  Lazy(options).defaults(Agent.defaults).each(function(v, k) {
    that[k] = v;
  });
  this.pos = Vec2.fromValues(x, y);
  this.vel = Vec2.create();
  this.group = group;
  if (this.debug) {
    this.debug = {};
  }
  if (this.path) {
    this.followPath(this.path, this.pathStart);
  }
};

Agent.prototype.getRadius = function() {
  return this.radius;
};

Agent.prototype.followPath = function(path, index) {
  index = index || 0;
  this.path = path;
  if (path) {
    this.joints = path.getJoints();
    if (this.group.isPathReverse()) {
      this.target = this.joints[index];
      this.pathNextIdx = index - 1;
    } else {
      this.target = this.joints[index];
      this.pathNextIdx = index + 1;
    }
  } else {
    this.target = null;
    this.pathNextIdx = 0;
  }
};

Agent.prototype.step = function(stepSize) {
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
      if (this.group.isPathReverse()) {
        if (this.pathNextIdx > 0) {
          // follow to next waypoint
          this.target = this.joints[this.pathNextIdx--];
        } else {
          // arrived at last!
          this.pathNextIdx = null;
          this.target = null;
        }
      } else {
        if (this.pathNextIdx < this.joints.length) {
          // follow to next waypoint
          this.target = this.joints[this.pathNextIdx++];
        } else {
          // arrived at last!
          this.pathNextIdx = null;
          this.target = null;
        }
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
