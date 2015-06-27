
var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');

var Wall = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = Wall.id++;
  this.width = options ? options.width || 0.2 : 0.2;
  // n joints, n-1 sections
  if (options && options.path) {
    this.path = options.path;
  } else {
    this.path = [[x, y]];
  }
};

Wall.prototype.getProjection = function(point, segment) {
  if (segment < 0 || segment >= this.path.length - 1) {
    throw 'Segment out of bounds';
  }
  var projection = Vec2.create();
  return Vec2.projectionToSegment(projection, point, this.path[segment], this.path[segment + 1]);
};

Wall.prototype.addPath = function(point) {
  this.path.push(point);
};

Wall.id = 0;

module.exports = Wall;
