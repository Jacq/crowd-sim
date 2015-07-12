
var Vec2 = require('../Common/Vec2');
var Entity = require('./Entity');
var Joint = require('./Joint');

var Wall = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = 'W' + Wall.id++;
  this.options = Lazy(options).defaults(Wall.defaults).toObject();
  this.entities.corners = [];
  if (x && y) {
    this.addCorner(x, y);
  }
};

Wall.prototype.addCorners = function(corner) {
  // n joints, n-1 sections
  for (var i in corner) {
    var p = corner[i];
    this.addCorner(p[0], p[1]);
  }
};

Wall.prototype.addCorner = function(x, y) {
  Entity.prototype.updatePos.call(this, x, y);
  var joint = new Joint(x, y, this.world, {radius: this.getCornerWidth()});
  this.entities.corners.push(joint);
  return joint;
};

Wall.prototype.getCorners = function() {
  return this.entities.corners;
};

Wall.prototype.getCornerWidth = function() {
  return this.options.width * 2;
};

Wall.prototype.getWidth = function() {
  return this.options.width;
};

Wall.prototype.getProjection = function(point, segment) {
  if (segment < 0 || segment >= this.entities.corners.length - 1) {
    throw 'Segment out of bounds';
  }
  var projection = Vec2.create();
  return Vec2.projectionToSegment(projection, point, this.entities.corners[segment].pos, this.entities.corners[segment + 1].pos);
};

Wall.defaults = {
  width: 0.2
};
Wall.id = 0;
Wall.type = 'wall';

module.exports = Wall;
