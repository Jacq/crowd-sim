'use strict';

//var $ = jQuery =

var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.world.save();

  var defaultOptions = {
    timeStepSize: 0.1
  };
  this.options = Lazy(options).defaults(defaultOptions).toObject();
};

Engine.prototype.setWorld = function(world) {
  this.world = world;
};

Engine.prototype.getWorld = function() {
  return this.world;
};

Engine.prototype.run = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  this._step();
  return this.running;
};

Engine.prototype.step = function() {
  if (this.running) {
    return;
  }
  this._step();
};

Engine.prototype._step = function() {
  var world = this.world;
  var options = this.options;
  var timeStepSize = options.timeStepSize;
  var agents = this.world.getAgents();
  Lazy(agents).each(function(agent) {
    agent.step(timeStepSize);
    if (agent.selected) {
      world.agentSelected = agent;
      return;
    }
  });
  Lazy(this.world.getGroups()).each(function(group) {
    group.step(timeStepSize);
  });

  this.iterations++;
  if (options.onStep) {
    options.onStep(world);
  }

  if (this.running) {
    var that = this;
    setTimeout(function() {
      that._step();
    }, options.timeStepRun * 1000);
  }
};

Engine.prototype.stop = function() {
  if (!this.running) {
    return;
  }
  this.running = false;
  return this.running;
};
Engine.prototype.reset = function() {
  this.iterations = 0;
  this.running = false;
  this.world.restore();
};

module.exports = Engine;
