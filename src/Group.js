'use strict';

var Agent = require('./Agent');
var Behavior = require('./Behavior');
var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Group = function(agentsNumber, world, startContext, endContext, options) {
  Entity.call(this);
  this._startContext = startContext;
  this._endContext = endContext;
  this.options = Lazy(options).defaults({
    pos: startContext.getRandomPoint.bind(startContext),
    size: function() {
      return 0.5;
    },
    behavior: new Behavior.Panic(world),
    debug: false,
    start: {prob: 0, // Adds agents per step in startContext
            rate: 0, // Adds agents probability per step in startContext
            max: 100},
    end: {prob: 0, // Removes agents per step in endContext
          rate: 0} // Removes agents probability per step in endContext
  }).toObject();
  this.id = Group.id++;

  this.behavior = this.options.behavior;
  this.world = world;
  this.agents = [];
  this.agentsNumber = agentsNumber;

  if (this.options.path) {
    this.assignPath(options.path);
  }
};

Group.prototype.assignPath = function(path) {
  this.path = path;
  for (var i  in this.agents) {
    this.agents[i].followPath();
  }
};

Group.prototype.generateAgents = function(agentsNumber, startContext) {
  if (!startContext) {
    startContext = this._startContext;
  }
  var newAgents = [];
  for (var i = 0; i < agentsNumber; i++) {
    var pos = isNaN(this.options.pos) ? this.options.pos() : this.options.pos;
    var size = isNaN(this.options.size) ? this.options.size() : this.options.size;
    var agent = new Agent(this, pos[0], pos[1], size, {debug: this.options.debug});
    agent.followPath();
    newAgents.push(agent);
  }
  return newAgents;
};

Group.prototype.addAgents = function(agentsNumber) {
  var newAgents = this.generateAgents(agentsNumber);
  this.agents = this.agents.concat(newAgents);
  this.world.addAgents(newAgents);
};

Group.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.agents.indexOf(agents[i]);
    this.agents.splice(j,1);
  }
  this.world.removeAgents(agents);
};

Group.prototype.addAgent = function(x, y) {
  var size = isNaN(this.options.size) ? this.options.size() : this.options.size;
  var agent = new Agent(this, x, y, size);
  this.agents.push(agent);
};

Group.prototype.getstartContext = function() {
  return this._startContext;
};

Group.prototype.getContext = function() {
  return [
    Vec2.fromValues(
      Lazy(this.agents).map(function(e) { return e.pos[0] - e.size; }).min(),
      Lazy(this.agents).map(function(e) { return e.pos[0] + e.size; }).max()
    ),
    Vec2.fromValues(
      Lazy(this.agents).map(function(e) { return e.pos[1] - e.size; }).min(),
      Lazy(this.agents).map(function(e) { return e.pos[1] + e.size; }).max()
    )
  ];
};

Group.prototype.addAgent = function(agent) {
  this.agents.concat(agent);
};

Group.prototype.step = function() {
  if (this.agents.length === 0) {
    this.addAgents(this.agentsNumber);
  }

  var start = this.options.start;
  if (start && start.rate > 0 && start.prob > 0 && this.agents.length < start.max) {
    var probBirth = Math.random();
    if (probBirth < start.prob) {
      var rate = start.rate ;
      if (start.rate + this.agents.length > start.max) {
        rate = start.max;
      }
      this.addAgents(rate);
    }
  }
  if (this._endContext) {
    var end = this.options.end;
    var agentsIn = this.world.agentsInContext(this._endContext,this.agents);
    if (agentsIn.length > 0 && end && end.rate > 0 && end.prob > 0) {
      var probDie = Math.random();
      if (probDie < end.prob) {
        this.removeAgents(agentsIn);
      }
    }
  }
};

Group.id = 0;

module.exports = Group;
