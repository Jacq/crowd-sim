'use strict';

/**
 *
 *
 * @param  {World} world [description]
 * @param  {Object} options [description]
 * {Vec2}       [description]
 */
var Behavior = function(world) {
  this.world = world;
};

// path point, point, other agent {point , radius}
Behavior.prototype.getAccel = function(agent, target) {};

module.exports = Behavior;
