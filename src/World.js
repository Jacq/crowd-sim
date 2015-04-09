/* global window,module, exports : true, define */

var World = function(x1, y1, x2, y2) {
  this.entities = {
    groups: [new CrowdSim.Group(this,0)],
    agents: [],
    walls: []
  };
  this.wrap = true;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
};

World.prototype.getDefaultGroup = function() {
  return this.entities.groups.first();
};

World.prototype.addGroup = function(group) {
  this.entities.groups = this.entities.groups.concat(group);
  this.entities.agents = this.entities.agents.concat(group.agents);
};

World.prototype.addWall = function(wall) {
  this.entities.walls = this.entities.walls.concat(wall);
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.entities.agents = JSON.parse(this.agentsSave);
};

module.exports = World;
