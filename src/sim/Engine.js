'use strict';

//var $ = jQuery =

/**
 * The simulation engine. Manages the state running of the simulation
 *
 * @class Engine
 * @constructor
 * @param {World} world
 * @param {Object} options
 */
var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.settings = Lazy(options).defaults(Engine.defaults).toObject();
  this.callbacks = this.settings.callbacks;
  delete this.settings.callbacks;
};

/**
 * Get the engine settings, configured in constructor [options]
 *
 * @method getSettings
 * @return {Object} options
 */
Engine.prototype.getSettings = function() {
  return this.settings;
};

/**
 * Sets the simulation world
 *
 * @method setWorld
 * @param {World} world
 */
Engine.prototype.setWorld = function(world) {
  this.world = world;
};

/**
 * Gets the simulation world
 *
 * @method getWorld
 * @return {World}
 */
Engine.prototype.getWorld = function() {
  return this.world;
};

/**
 * Starts the simulation
 *
 * @method run
 * @param {Entity} entity to report in the onStart callback as trigger
 * @return {Boolean} true if running; false otherwise
 */
Engine.prototype.run = function(entity) {
  if (this.running) {
    return;
  }
  this.running = true;
  this.world.freeze(false);
  if (this.callbacks.onStart) {
    this.callbacks.onStart(entity);
  }
  this._step();
  return this.running;
};

/**
 * Advance one step the simulation and stops.
 *
 * @method step
 * @return {Boolean} true if running; false otherwise
 */
Engine.prototype.step = function() {
  if (this.running) {
    this.stop();
  }
  this._step();
  return this.running;
};

/**
 * Internal step of the simulation engine. Periodically called.
 * @method _step
 */
Engine.prototype._step = function() {
  // calculate next execution
  var startTime = new Date();
  var opts = this.settings;
  var timeStepSize = opts.timeStepSize;

  var entity = this.world.step(timeStepSize); // returns entity that request stop a contexts
  this.iterations++;
  if (this.callbacks.onStep) {
    this.callbacks.onStep(this.world);
  }
  // entity requests stop of simulation
  if (entity) {
    this.stop(entity);
  }

  if (this.running) {
    var that = this;
    // using setTimeout instead of setInterval allows dinamycally changing timeStep while running
    var endTime = new Date();
    var timeToWait = (opts.timeStepRun * 1000) - (endTime - startTime);
    timeToWait = timeToWait > 0 ? timeToWait : 0;
    setTimeout(function() {
      that._step();
    }, timeToWait);
  }
};

/**
 * Stops the simulation
 *
 * @method stop
 * @param {Entity} entity to report in the onStart callback as trigger
 * @return {Boolean} true if running; false otherwise
 */
Engine.prototype.stop = function(entity) {
  if (!this.running) {
    return;
  }
  this.world.freeze(true);
  this.running = false;
  if (this.callbacks.onStop) {
    this.callbacks.onStop(entity);
  }
  return this.running;
};

/**
 * Resets=Restarts the state of the simulation.
 *
 * @method reset
 * @return {Boolean} true if running; false otherwise
 */
Engine.prototype.reset = function() {
  var groups = this.world.getGroups();
  Lazy(groups).each(function(g) {
    g.emptyAgents();
  });
  this.stop();
  this.iterations = 0;
  return this.running;
};

Engine.defaults = {
  timeStepSize: 0.05,
  timeStepRun: 0.01,
  callbacks: {
    onStart: null,
    onStep: null,
    onStop: null
  }
};

module.exports = Engine;
