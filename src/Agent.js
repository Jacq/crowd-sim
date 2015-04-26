'use strict';

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
  this.maxAccel = 0.5; // pixels/seg^2
  this.maxVel = 1; // pixels/seg  1pix~10m
  this.mass = 80e3;
};

Agent.prototype.followPath = function(index) {
  if (this.group.path) {
    this.target = this.group.path[index || 0];
    this.pathNextIdx = 1;
  } else {
    this.target = null;
    this.pathNextIdx = 0;
  }
};

Agent.prototype.step = function(stepSize) {
  var accel = this.group.behavior(this);
  this.move(accel, stepSize);
  if (this.target) {
    var distToTarget = Vec2.distance(this.pos, this.target);
    if (this.target < this.path.size) {
      if (this.path.length < this.pathNextIdex) {
        // follow to next waypoint
        this.target = this.path[this.pathNextIdx++];
      } else {
        // arrived at last!
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

module.exports = Agent;
