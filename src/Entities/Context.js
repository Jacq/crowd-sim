
var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');

var Context = function(x, y, parent, options) {
  Entity.call(this, x, y, parent);
  this.id = 'C' + Context.id++;
  this.options = Lazy(options).defaults(Context.defaults).toObject();
  this.entities.groups = [];
};

Context.prototype.destroy = function() {
  Lazy(this.entities.groups).each(function(g) {
    g.unAssignContext(context);
  });
  this.parent.removeEntity(this);
  Entity.prototype.destroy.call(this);
};

Context.prototype.assignToGroup = function(entity) {
  var idx = this.entities.groups.indexOf(entity);
  if (idx > -1) {
    throw 'Entity already associated';
  } else {
    this.entities.groups.push(entity);
  }
};

Context.prototype.unassignFromGroup = function(group) {
  var idx = this.entities.groups.indexOf(group);
  if (idx > -1) {
    this.entities.groups.splice(idx, 1);
  } else {
    throw 'Entity not associated';
  }
};

Context.prototype.getAssignedGroups = function() {
  return this.entities.groups;
};

Context.prototype.unassignAll = function(entity) {
  this.entities.length = 0;
};

Context.prototype.setArea = function(x, y) {
  this.options.width = Math.abs(this.pos[0] - x) * 2;
  this.options.height = Math.abs(this.pos[1] - y) * 2;
};

Context.prototype.getWidth = function() {
  return this.options.width;
};

Context.prototype.getHeight = function() {
  return this.options.height;
};

Context.prototype.getRandomPoint = function() {
  var x = this.pos[0] + (Math.random() - 0.5) * this.options.width;
  var y = this.pos[1] + (Math.random() - 0.5) * this.options.height;
  return Vec2.fromValues(x, y);
};

Context.prototype.in = function(pos) {
  var w2 = this.options.width / 2;
  var h2 = this.options.height / 2;
  var isIn = (this.pos[0] - w2 < pos[0] && pos[0] < this.pos[0] + w2) &&
             (this.pos[1] - h2 < pos[1] && pos[1] < this.pos[1] + h2);
  return isIn;
};

Context.defaults = {
  mobility: 1,
  hazardLevel: 0,
  width: 10,
  height: 10
};
Context.id = 0;
Context.type = 'context';

module.exports = Context;
