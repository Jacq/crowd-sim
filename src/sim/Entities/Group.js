'use strict';

var Entity = require('./Entity');
var Context = require('./Context');
var Path = require('./Path');
var Agent = require('../Agent');
var Vec2 = require('../Common/Vec2');
var Grid = require('../Common/Grid');
var Panic = require('../Behavior/Panic');

/**
 * Group Entity where agents belong.
 *
 * @class Group
 * @module Entities
 * @submodule Group
 * @constructor
 * @param {Number} x coordinate
 * @param {Number} y coordinate
 * @param {World} parent world
 * @param {Object} [options]
 * @param {String} id to use insted of autogenerate it, used when loading worlds
 * @extends Entity
 */
var Group = function(x, y, parent, options, id) {
  this.options = Lazy(options).defaults(Group.defaults).toObject();
  this.id = id || 'G' + Group.id;
  Group.id = Entity.prototype.calcNewId.call(this, Group.id);
  Entity.call(this, x, y, parent, this.options);
  this.behavior = new Panic(this.parent);
  this.agents = [];
  this.agentsCount = this.options.agentsCount;
  this.entities.path = null;
  this.entities.startContext = null;
  this.entities.endContext = null;
};

/**
 * Destroy the Group
 *
 * @method destroy
 */
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

/**
 * Get radius
 *
 * @method getRadius
 * @return {Number} radius
 */
Group.prototype.getRadius = function() {
  return this.options.radius;
};

/**
 * Set radius
 *
 * @method setRadius
 * @param {Number} radius
 */
Group.prototype.setRadius = function(radius) {
  this.options.radius = radius;
};

/**
 * Increment radius by dr.
 *
 * @method incrRadius
 * @param {Number} dr increment
 */
Group.prototype.incrRadius = function(dr) {
  this.options.radius = Math.abs(this.options.radius + dr);
};

/**
 * Gets the end context where agents are destoyed optionally.
 *
 * @method getStartContext
 * @return {Context} end context
 */
Group.prototype.getStartContext = function() {
  return this.entities.startContext;
};

/**
 * Sets the start context where agents are created
 *
 * @method assignStartContext
 * @param {Context} context
 */
Group.prototype.assignStartContext = function(context) {
  if (this.entities.startContext) {
    this.entities.startContext.unassignFromGroup(this);
  }
  if (context) {
    context.assignToGroup(this);
  }
  this.entities.startContext = context;
};

/**
 * Gets the start context where agents are created
 *
 * @method getEndContext
 * @return {Context} end context
 */
Group.prototype.getEndContext = function() {
  return this.entities.endContext;
};

/**
 * Sets the end context where agents are destroyed.
 *
 * @method assignEndContext
 * @param {Context} context
 */
Group.prototype.assignEndContext = function(context) {
  if (this.entities.endContext) {
    this.entities.endContext.unassignFromGroup(this);
  }
  if (context) {
    context.assignToGroup(this);
  }
  this.entities.endContext = context;
};

/**
 * Gets the path asigned to the group that agents will follow.
 *
 * @method getPath
 * @return {Array} paths
 */
Group.prototype.getPath = function() {
  return this.entities.path;
};

/**
 * Assign a path to the group and its agents.
 *
 * @method assignPath
 * @param {Path} path
 * @param {Number} idx start index
 */
Group.prototype.assignPath = function(path, idx) {
  if (this.entities.path) {
    this.entities.path.unassignFromGroup(this);
  }
  this.options.pathStart = idx || 0;
  this.entities.path = path;
  if (path) {
    path.assignToGroup(this);
    for (var i  in this.agents) {
      this.agents[i].followPath(path, this.options.pathStart);
    }
  }
};

/**
 * Gets the flag pathReverse from options.
 *
 * @method isPathReverse
 * @return {Boolean} true if path is reversed
 */
Group.prototype.isPathReverse = function() {
  return this.options.pathReverse;
};

/**
 * Gets the flag pathCircular from options.
 *
 * @method isPathCircular
 * @return {Boolean} true if path is circular
 */
Group.prototype.isPathCircular = function() {
  return this.options.pathCircular;
};

/**
 * Gets the start index of the agents in the group path.
 *
 * @method getPathStartIdx
 * @return {Number} start index
 */
Group.prototype.getPathStartIdx = function() {
  return this.options.pathStart;
};

/**
 * Unassing a start, end contexts or a path from the group.
 *
 * @method unAssign
 * @param {Entity} entity , context or path.
 */
Group.prototype.unAssign = function(entity) {
  if (entity instanceof Context) {
    if (this.entities.startContext === entity) {
      this.entities.startContext = null;
      entity.unassignFromGroup(this);
    }
    if (this.entities.endContext === entity) {
      this.entities.endContext = null;
      entity.unassignFromGroup(this);
    }
  } else if (entity instanceof Path) {
    this.entities.path = null;
    entity.unassignFromGroup(this);
  } else {
    throw 'Entity not assigned to group';
  }
};

/**
 * Assign a behavior model to the group.
 *
 * @method assignBehavior
 * @param {Behavior} behavior
 */
Group.prototype.assignBehavior = function(behavior) {
  this.behavior = behavior;
};

/**
 * Generate a number of agents in a context. Used internally by the group.
 *
 * @method generateAgents
 * @param {Number} agentsCount
 * @param {Context} startContext
 * @return newAgents
 */
Group.prototype.generateAgents = function(agentsCount, startContext) {
  if (!startContext) {
    startContext = this.entities.startContext;
  }
  // functions to set initial position
  var newAgents = [];
  var opts = this.options;
  var pos = Vec2.create();
  var radius = this.options.radius;
  var initPos = this.pos;

  /**
   * Generates a random init position in the group radius centered at pos.
   *
   * @method myInitPos
   * @param {Vec2} pos center position
   * @return {Vec2} point
   */
  function myInitPos(pos) {
    var r = Math.random() * radius;
    Vec2.random(pos, r);
    Vec2.add(pos, pos, initPos);
    return pos;
  }
  /**
   * Generates a position within the group start context.
   *
   * @method myContextPos
   * @return {Vec2} point
   */
  function myContextPos() {
    return startContext.getRandomPoint();
  }
  var getInitPos = startContext ? myContextPos : myInitPos;
  var numberToGenerate = Math.min(agentsCount, this.options.agentsMax);
  // agent generation
  for (var i = 0; i < numberToGenerate; i++) {
    pos = getInitPos(pos);
    var size = opts.agentsSizeMin;
    var mass = Agent.defaults.mass;
    if (opts.agentsSizeMin !== opts.agentsSizeMax) {
      // random uniform distribution
      size = opts.agentsSizeMin + Math.random() * (opts.agentsSizeMax - opts.agentsSizeMin);
      // scale mass around average proportional to size
      mass = Agent.defaults.mass * (size - (opts.agentsSizeMax + opts.agentsSizeMin) / 2 + 1);
    }
    var agent = new Agent(pos[0], pos[1], this, {
      size: size,
      mass: mass,
      debug: opts.debug,
      path: this.entities.path,
      aspect: this.options.agentsAspect || Math.round(Math.random() * 0xFFFFFF),
      pathStart: this.options.pathStart,
      maxAccel: this.options.agentsMaxAccel,
      maxVel: this.options.agentsMaxVel
    });
    //agent.followPath(this.entities.path, this.options.startIdx);
    //agent.assignBehavior(behavior);
    newAgents.push(agent);
  }
  return newAgents;
};

/**
 * Add agents to the group.
 *
 * @method addAgents
 * @param {Number} agentsCount the number of agents
 */
Group.prototype.addAgents = function(agentsCount) {
  var newAgents = this.generateAgents(agentsCount);
  this.agents = this.agents.concat(newAgents);
  this.parent.addAgents(newAgents);
};

/**
 * Removes all agents from the group.
 *
 * @method emptyAgents
 */
Group.prototype.emptyAgents = function() {
  this.parent.removeAgents(this.agents);
  this.agents.length = 0;
};

/**
 * Remove the given agents from the group.
 *
 * @method removeAgents
 * @param {Array} agents
 */
Group.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.agents.indexOf(agents[i]);
    this.agents.splice(j, 1);
  }
  this.parent.removeAgents(agents);
};

/**
 * Check if am agent is within a group area.
 *
 * @method in
 * @param {Vec2} pos
 * @return {Boolean} true if inside; false otherwise
 */
Group.prototype.in = function(pos) {
  return Vec2.squaredDistance(pos, this) < this.options.radius * this.options.radius;
};

/**
 * Adds a single agent to the group.
 *
 * @method addAgent
 * @param {Agent} agent
 */
Group.prototype.addAgent = function(agent) {
  this.agents.push(agent);
};

/**
 * Gets the smaller rectangle area that contains the group agents
 *
 * @method getArea
 * @return {Array} array of two {Vec2} [[Xmin,Xmax][Ymin,YMax]]
 */
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

/**
 * Advances the simulation of the group by creating/destroying agents in its contexts.
 *
 * @method step
 */
Group.prototype.step = function() {
  if (this.agents.length === 0) {
    this.addAgents(this.options.agentsCount);
  }

  // generate agents in startContext based on uniform distribution
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
  // destroy nth-first agents in endContext based on uniform distribution
  if (this.entities.endContext && this.options.endRate > 0 && this.options.endProb > 0) {
    var probDie = Math.random();
    if (probDie < this.options.endProb) {
      var endContext = this.entities.endContext;
      var agentsOut = Lazy(this.agents).filter(function(agent) {
          return endContext.in(agent.pos);
        })
        .first(this.options.endRate).toArray();
      this.removeAgents(agentsOut);
    }
  }
};

Group.defaults = {
  agentsMaxVel: 1,
  agentsMaxAccel: 0.5,
  agentsAspect: 0, // used for colors
  agentsSizeMin: 0.5,
  agentsSizeMax: 0.5,
  agentsCount: 10,
  agentsMax: 100,
  debug: false,
  pathStart: 0,
  pathReverse: false,
  pathCircular: false,
  radius: 3, // used when no start context is associated
  startProb: 0, // Adds agents per step in startContext
  startRate: 0, // Adds agents probability per step in startContext
  endProb: 0, // Removes agents per step in endContext
  endRate: 0 // Removes agents probability per step in endContext
};
Group.id = 0;
Group.type = 'group';

module.exports = Group;
