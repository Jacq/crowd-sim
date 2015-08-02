'use strict';

//var $ = jQuery =

var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.world.save();

  this.settings = Lazy(options).defaults(Engine.defaults).toObject();
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
  var opts = this.settings;
  var timeStepSize = opts.timeStepSize;
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

  if (this.running) {
    var that = this;
    setTimeout(function() {
      that._step();
    }, opts.timeStepRun * 1000);
  }

  this.iterations++;
  if (this.onStep) {
    this.onStep(world);
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
  this.stop();
  this.iterations = 0;
  var groups = this.world.getGroups();
  Lazy(groups).each(function(g) {
    g.emptyAgents();
  });
  //this.world.restore();
};

Engine.defaults = {
  timeStepSize: 0.1,
  timeStepRun: 0.001
};

module.exports = Engine;
