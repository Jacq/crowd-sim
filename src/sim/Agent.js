'use strict';

var Vec2 = require('./Common/Vec2');

/**
 * The agents that live in the simulation engine.
 *
 * @class Agent
 * @module CrowdSim
 * @submodule Agent
 * @constructor
 * @param {Number} x coordinate
 * @param {Number} y coordinate
 * @param {Group} group parent
 * @param {Object} options
 */
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
  this.currentMobility = this.mobility;
  if (this.debug) {
    this.debug = {};
  }
  if (this.path) {
    this.followPath(this.path, this.pathStart);
  } else if (this.group.getEndContext()) {
    this.setTargetInContext(this.group.getEndContext());
  } else {
    this.target = this.group;
  }
};

/**
 * Sets as the agent target the nearest point of a Context.
 *
 * @method setTargetInContext
 * @param {Context} context
 */
Agent.prototype.setTargetInContext = function(context) {
  // go to nearest point in contexts
  var point = context.getNearestPoint(this.pos);
  // generate virtual target
  this.target = {pos: point, in: context.in.bind(context)};
};

/**
 * Gets the aspect property. Used for color codes could be used for other purposes
 *
 * @method getAspect
 * @return {Number} aspect
 */
Agent.prototype.getAspect = function() {
  return this.aspect;
};

/**
 * Get radius
 * @method getRadius
 * @return {Number} radius
 */
Agent.prototype.getRadius = function() {
  return this.radius;
};

/**
 * Set mobility correction applied to the current velocity
 *
 * @method setCurrentMobility
 * @param {Number} mobility factor 0.0-1.0
 */
Agent.prototype.setCurrentMobility = function(mobility) {
  this.currentMobility = mobility;
};

/**
 * Set the agent to follow a give path starting at index.
 *
 * @method followPath
 * @param {Path} path
 * @param {Number} index position in path
 */
Agent.prototype.followPath = function(path, index) {
  index = index || 0;
  this.path = path;
  if (path) {
    this.pathStartIdx = index;
    this._startPath();
  } else {
    this.target = null;
    this.pathNextIdx = 0;
  }
};

/**
 * Helper to set the path start that takes into account inverse paths.
 *
 * @method _startPath
 */
Agent.prototype._startPath = function() {
  this.joints = this.path.getJoints();
  if (this.group.isPathReverse()) {
    this.target = this.joints[this.pathStartIdx];
    this.pathNextIdx = this.pathStartIdx - 1;
  } else {
    this.target = this.joints[this.pathStartIdx];
    this.pathNextIdx = this.pathStartIdx + 1;
  }
};

/**
 * Advances the simulation of the agent one stepSize and moves the agent to its next possition defined by the group behavior mode.
 *
 * @method step
 * @param {Number} stepSize defined by the simulation step size
 */
Agent.prototype.step = function(stepSize) {
  var accel = this.group.behavior.getAccel(this, this.target);

  if (this.debug) {
    if (accel && (isNaN(accel[0]) || isNaN(accel[1]))) {
      throw 'Agent pos invalid';
    }
  }

  this.move(accel, stepSize);
  // update target to next if arrive at current
  var last = false;
  if (this.target) {
    if (this.pathNextIdx >= -1 && this.target.in(this.pos)) {
      if (this.group.isPathReverse()) {
        if (this.pathNextIdx >= 0) {
          // follow to next waypoint
          this.target = this.joints[this.pathNextIdx--];
        } else {
          last = true;
        }
      } else {
        if (this.pathNextIdx < this.joints.length) {
          // follow to next waypoint
          this.target = this.joints[this.pathNextIdx++];
        } else {
          last = true;
        }
      }
      if (last) { // last point check if is a circular path or end in endContext
        if (this.group.isPathCircular()) {
          this._startPath();
        } else { // do one last trip for symetry to endContext if exists for symetry
          var endContext = this.group.getEndContext();
          if (endContext) {
            this.setTargetInContext(endContext);
          }
        }
      }
    }
  }
};

/**
 * Moves the agent with the given accel => speed => position
 *
 * @method move
 * @param {Number} accel
 * @param {Number} stepSize simulation
 */
Agent.prototype.move = function(accel, stepSize) {
  Vec2.scaleAndAdd(this.vel, this.vel, accel, stepSize);
  if (Vec2.length(this.vel) > this.maxVel) {
    Vec2.normalizeAndScale(this.vel, this.vel, this.maxVel * this.currentMobility);
  }
  Vec2.scaleAndAdd(this.pos, this.pos, this.vel, stepSize);

  this.currentMobility = this.mobility; // restore mobility for next step reduced by contexts
};

Agent.defaults = {
  aspect: 0xFFFFFF, // used for coloring
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
