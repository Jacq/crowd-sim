/* global window,module, exports : true, define */

var World = function(x1, y1, x2, y2) {
  this.groups = [new CrowdSim.Group(0)];
  this.walls = [];
  this.wrap = true;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
};

World.prototype.getDefaultGroup = function() {
  return this.groups[0];
};

World.prototype.addGroup = function(group) {
  this.groups = Lazy(this.groups).concat(group);
};

World.prototype.addWall = function(wall) {
  this.walls = Lazy(this.walls).concat(wall);
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.agents = JSON.parse(this.agentsSave);
};

World.prototype.getGroups = function() {
  return Lazy(this.groups);
};

World.prototype.getAgents = function() {
  return Lazy(this.groups).map(function(g) { return g.agents; }).flatten();
};

World.prototype.getWalls = function() {
  return Lazy(this.walls);
};

module.exports = World;
