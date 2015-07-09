'use strict';
/* global CrowdSim */

var World = function(x, y, width, height) {
  var that = this;
  this.groups = [];
  this.entities = {
    agents: [],
    contexts: [],
    paths: [],
    walls: [],
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
  return this.groups[0];
};

World.prototype.getGroups = function() {
  return this.groups;
};

World.prototype.addAgents = function(agents) {
  this.entities.agents = this.entities.agents.concat(agents);
  if (this.onCreateAgents) {
    this.onCreateAgents(agents);
  }
};

World.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.entities.agents.indexOf(agents[i]);
    this.entities.agents.splice(j,1);
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

World.prototype.addContext = function(context) {
  this.entities.contexts = this.entities.contexts.concat(context);
  this._onCreate(context);
};

World.prototype.addGroup = function(group) {
  this.groups = this.groups.concat(group);
  this._onCreate(group);
};

World.prototype.addPath = function(path) {
  this.entities.paths = this.entities.paths.concat(path);
  this._onCreate(path);
};

World.prototype.addWall = function(wall) {
  this.entities.walls = this.entities.walls.concat(wall);
  this._onCreate(wall);
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.entities.agents = JSON.parse(this.agentsSave);
};

// TODO add spatial structure to optimize this function
World.prototype.getNeighbours = function(agent) {
  return this.entities.agents;
};

// TODO add spatial structure to optimize this function
World.prototype.getNearWalls = function(agent) {
  return this.entities.walls;
};

// TODO add spatial structure to optimize this function
World.prototype.agentsInContext = function(context, agents) {
  if (!agents) {
    agents = this.entities.agents;
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
