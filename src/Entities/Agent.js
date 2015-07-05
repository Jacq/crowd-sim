'use strict';

var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');

var Agent = function(group, x, y, size, options) {
  Entity.call(this, x, y);
  this.options = Lazy(options).defaults({
    debug: false
  }).toObject();
  this.id = Agent.id++;
  this.group = group;
  this.vel = Vec2.create();
  this.size = size;
  this.mobility = 1.0;
  this.behavior = null; // function set by group
  this.maxAccel = 0.5; // m/s^2
  this.maxVel = 1; // m/seg
  this.mass = 80e3;
  if (this.options.debug) {
    this.debug = {};
  }
};

Agent.prototype.followPath = function(index) {
  if (this.group.path) {
    this.target = this.group.path.wps[index || 0];
    this.pathNextIdx = 1;
  } else {
    this.target = null;
    this.pathNextIdx = 0;
  }
};

Agent.prototype.step = function(stepSize) {
  var path = this.group.path;
  var accel = this.group.behavior.getAccel(this, this.target);

  if (!accel && accel !== 0) {
    throw 'Agent pos invalid';
  }
  this.move(accel, stepSize);
  // update target to next if arrive at current
  if (this.target) {
    var distToTarget = Vec2.distance(this.pos, this.target.pos);
    if (distToTarget < this.target.radius) {
      if (this.pathNextIdx < path.wps.length) {
        // follow to next waypoint
        this.target = path.wps[this.pathNextIdx++];
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

  /*if (this.world.wrap) {
    if (agent.pos[0] > this.world.MAX_X) {
      agent.pos[0] = this.world.MIN_X + agent.pos[0] - world.MAX_X;
    }
    if (agent.pos[0] < this.world.MIN_X) {
      agent.pos[0] = this.world.MAX_X - (this.world.MIN_X - entity.pos[0]);
    }
    if (agent.pos[1] > this.world.MAX_Y) {
      agent.pos[1] = this.world.MIN_Y + entity.pos[1] - this.world.MAX_Y;
    }
    if (agent.pos[1] < this.world.MIN_Y) {
      agent.pos[1] = this.world.MAX_Y - (this.world.MIN_Y - entity.pos[1]);
    }
  }*/
};

Agent.id = 0;
Agent.type = 'agent';

module.exports = Agent;
