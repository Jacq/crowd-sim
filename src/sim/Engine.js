'use strict';

//var $ = jQuery =

var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.settings = Lazy(options).defaults(Engine.defaults).toObject();
  this.callbacks = this.settings.callbacks;
  delete this.settings.callbacks;
};

Engine.prototype.getSettings = function() {
  return this.settings;
};

Engine.prototype.setWorld = function(world) {
  this.world = world;
};

Engine.prototype.getWorld = function() {
  return this.world;
};

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

Engine.prototype.step = function() {
  if (this.running) {
    this.stop();
  }
  this._step();
  return this.running;
};

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
