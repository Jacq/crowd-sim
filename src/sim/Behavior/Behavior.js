'use strict';

/**
 * Base behavior
 *
 * @class Behavior
 * @module CrowdSim
 * @submodule Behavior
 * @constructor
 * @param {World} world parent
 */
var Behavior = function(world) {
  this.world = world;
};

/**
 * Return the acceleration result for a agent going to its target.
 *
 * @method getAccel
 * @param {Agent} agent
 * @param {Object} target a destination with target.pos and target.in = function => path point, point, other agent
 * @return {Vec2} acceleration result of the model
 */
Behavior.prototype.getAccel = function(agent, target) {};

module.exports = Behavior;
