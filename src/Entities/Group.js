'use strict';

var Entity = require('./Entity');
var Context = require('./Context');
var Agent = require('../Agent');
var Vec2 = require('../Common/Vec2');
var Panic = require('../Behavior/Panic');

var Group = function(x, y, parent, options) {
  Entity.call(this, x, y, parent);
  this.id = 'G' + Group.id++;
  this.options = Lazy(options).defaults(Group.defaults).toObject();
  this.behavior = new Panic(this.parent);
  this.agents = [];
  this.agentsCount = this.options.agentsCount;
  this.entities.path = null;
  this.entities.startContext = null;
  this.entities.endContext = null;
};

Group.prototype.destroy = function() {
  this.emptyAgents();
  this.behavior = null;
  if (this.entities.startContext) {
    this.entities.startContext.unassignFromGroup(this);
  }
  if (this.entities.endContext) {
    this.entities.endContext.unassignFromGroup(this);
  }
  Entity.prototype.destroy.call(this);
};

Group.prototype.getStartContext = function() {
  return this.entities.startContext;
};

Group.prototype.assignStartContext = function(context) {
  context.assignToGroup(this);
  this.entities.startContext = context;
};

Group.prototype.getEndContext = function() {
  return this.entities.endContext;
};

Group.prototype.assignEndContext = function(context) {
  context.assignToGroup(this);
  this.entities.endContext = context;
};

Group.prototype.unAssignContext = function(context) {
  if (this.entities.startContext === context) {
    this.entities.startContext = null;
    context.unassign(this);
  }
  if (this.entities.endContext === context) {
    this.entities.endContext = context;
    context.unassign(this);
  }
};

Group.prototype.assignBehavior = function(behavior) {
  this.behavior = behavior;
};

Group.prototype.assignPath = function(path) {
  this.entities.path = path;
  for (var i  in this.agents) {
    this.agents[i].followGroupPath();
  }
};

Group.prototype.generateAgents = function(agentsCount, startContext) {
  if (!startContext) {
    startContext = this.entities.startContext;
  }
  var newAgents = [];
  var opts = this.options;
  for (var i = 0; i < agentsCount; i++) {
    var pos = this.entities.startContext ? this.entities.startContext.getRandomPoint() : this.pos;
    var size = opts.agentsSizeMin;
    if (opts.agentsSizeMin !== opts.agentsSizeMax) {
      // random uniform distribution
      size = opts.agentsSizeMin + Math.random() * (opts.agentsSizeMax - opts.agentsSizeMin);
    }
    var agent = new Agent(pos[0], pos[1], this, {size: size, debug: opts.debug});
    agent.followGroupPath();
    newAgents.push(agent);
  }
  return newAgents;
};

Group.prototype.addAgents = function(agentsCount) {
  var newAgents = this.generateAgents(agentsCount);
  this.agents = this.agents.concat(newAgents);
  this.parent.addAgents(newAgents);
};

Group.prototype.emptyAgents = function() {
  this.parent.removeAgents(this.agents);
  this.agents.length = 0;
};

Group.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.agents.indexOf(agents[i]);
    this.agents.splice(j, 1);
  }
  this.parent.removeAgents(agents);
};

Group.prototype.getPath = function() {
  return this.entities.path;
};

Group.prototype.getArea = function() {
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
  this.agents.push(agent);
};

Group.prototype.step = function() {
  if (this.agents.length === 0) {
    this.addAgents(this.options.agentsCount);
  }

  if (this.options.startRate > 0 && this.options.startProb > 0 && this.agents.length < this.options.agentsMax) {
    var probBirth = Math.random();
    if (probBirth < this.options.startProb) {
      var rate = this.options.startRate ;
      if (rate + this.agents.length > this.options.agentsMax) {
        // limit maximun agents
        rate = this.options.agentsMax;
      }
      this.addAgents(rate);
    }
  }
  if (this.entities.endContext) {
    var agentsIn = this.parent.agentsInContext(this.entities.endContext, this.agents);
    if (agentsIn.length > 0 && this.options.endRate > 0 && this.options.endProb > 0) {
      var probDie = Math.random();
      if (probDie < this.options.endProb) {
        this.removeAgents(agentsIn);
      }
    }
  }
};

Group.defaults = {
  agentsSizeMin: 0.5,
  agentsSizeMax: 0.5,
  agentsCount: 10,
  agentsMax: 100,
  debug: false,
  startProb: 0, // Adds agents per step in startContext
  startRate: 0, // Adds agents probability per step in startContext
  endProb: 0, // Removes agents per step in endContext
  endRate: 0 // Removes agents probability per step in endContext
};
Group.id = 0;
Group.type = 'group';

module.exports = Group;
