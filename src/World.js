'use strict';
/* global CrowdSim */

var World = function(x, y, width, height) {
  var that = this;
  this.agents = [];

  this.entities = {
    contexts: [],
    groups: [],
    paths: [],
    walls: []
  };
  this.wrap = true;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.onCreateAgents = null;
  this.onDestroyAgents = null;
  this.onCreateEntity = null;
  this.onDestroyEntity = null;
};

World.prototype.getDefaultGroup = function() {
  return this.entities.groups[0];
};

World.prototype.getGroups = function() {
  return this.entities.groups;
};

World.prototype.getAgents = function() {
  return this.agents;
};

World.prototype.addAgents = function(agents) {
  this.agents = this.agents.concat(agents);
  if (this.onCreateAgents) {
    this.onCreateAgents(agents);
  }
};

World.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.agents.indexOf(agents[i]);
    this.agents.splice(j,1);
  }
  if (this.onDestroyAgents) {
    this.onDestroyAgents(agents);
  }
};

World.prototype._onCreate = function(entity) {
  if (this.onCreateEntity) {
    this.onCreateEntity(entity);
  }
};

World.prototype._onDestroy = function(entity) {
  if (this.onDestroyEntity) {
    this.onDestroyEntity(entity);
  }
};

World.prototype._getEntityList = function(entity) {
  if (entity instanceof CrowdSim.Context) { // is context
    return this.entities.contexts;
  } else if (entity instanceof CrowdSim.Group) { // is group
    return this.entities.groups;
  } else if (entity instanceof CrowdSim.Path) { // is path
    return this.entities.paths;
  } else if (entity instanceof CrowdSim.Wall) { // is wall
    return this.entities.walls;
  } else {
    throw 'Entity object is not context, group, wall or path';
  }
};

World.prototype.removeEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  var idx = entityList.indexOf(entity);
  entityList.splice(idx,1);
  this._onDestroy(entity);
};

World.prototype.addEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  entityList.push(entity);
};

World.prototype.addContext = function(context) {
  this.entities.contexts.push(context);
  this._onCreate(context);
};

World.prototype.addGroup = function(group) {
  this.entities.groups.push(group);
  this._onCreate(group);
};

World.prototype.addPath = function(path) {
  this.entities.paths.push(path);
  this._onCreate(path);
};

World.prototype.addWall = function(wall) {
  this.entities.walls.push(wall);
  this._onCreate(wall);
};

World.prototype.getEntityById = function(id) {
  return Lazy(this.entities).values().flatten().findWhere({id: id});
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.agents = JSON.parse(this.agentsSave);
};

// TODO add spatial structure to optimize this function
World.prototype.getNeighbours = function(agent) {
  return this.agents;
};

// TODO add spatial structure to optimize this function
World.prototype.getNearWalls = function(agent) {
  return this.entities.walls;
};

// TODO add spatial structure to optimize this function
World.prototype.agentsInContext = function(context, agents) {
  if (!agents) {
    agents = this.agents;
  }
  var agentsIn = [];
  for (var i in agents) {
    var agent = agents[i];
    if (context.in(agent.pos)) {
      agentsIn.push(agent);
    }
  }
  return agentsIn;
};

module.exports = World;
