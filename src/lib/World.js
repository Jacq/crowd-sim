/* global window,module, exports : true, define */

World = function(x1, y1, x2, y2) {
  this.agents = [];
  this.wrap = true;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
};

World.prototype.add = function(entity) {
  this.agents.push(entity);
};
World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.agents = JSON.parse(this.agentsSave);
};

module.exports = World;
