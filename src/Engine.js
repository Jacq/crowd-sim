
var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.world.save();

  var defaultOptions = {
    step: 0.1
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
  this.world.getAgents().each(function(agent) {
    if (agent.selected) {
      world.agentSelected = agent;
      return;
    }
    agent.step(world,options.step);
    if (options.onStep) {
      options.onStep(world);
    }
  });
  this.iterations++;
  if (this.running) {
    var that = this;
    setTimeout(function() {
      that._step();
    }, this.STEP);
  }
};

Engine.prototype.stop = function() {
  if (!this.running) {
    return;
  }
  this.running = false;
};
Engine.prototype.reset = function() {
  this.iterations = 0;
  this.running = false;
  this.world.restore();
};

module.exports = Engine;
