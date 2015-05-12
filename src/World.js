'use strict';
/* global CrowdSim */

var World = function(x1, y1, x2, y2) {
  var that = this;
  this.entities = {
    groups: [new CrowdSim.Group(0, that)],
    agents: [],
    walls: [],
    paths: []
  };
  this.wrap = true;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
};

World.prototype.getDefaultGroup = function() {
  return this.entities.groups[0];
};

World.prototype.addGroup = function(group) {
  this.entities.groups = this.entities.groups.concat(group);
  group.onNewAgents = this.onNewAgents;
  this.addAgents(group.agents);
};

World.prototype.addAgents = function(agents) {
  this.entities.agents = this.entities.agents.concat(agents);
};

World.prototype.addWall = function(wall) {
  this.entities.walls = this.entities.walls.concat(wall);
};

World.prototype.addPath = function(path) {
  this.entities.paths = this.entities.paths.concat(path);
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.entities.agents = JSON.parse(this.agentsSave);
};

World.prototype.getNeighbours = function(agent) {
  return this.entities.agents;
};

World.prototype.getNearWalls = function(agent) {
  return this.entities.walls;
};

module.exports = World;
