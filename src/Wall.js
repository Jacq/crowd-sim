
var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Wall = function(path, options) {
  Entity.call(this);
  if (!path || path.length < 2) {
    throw 'Walls must have at least two points';
  }
  this.width = this.options ? options.width || 0.2 : 0.2;
  this.path = path; // n joints, n-1 sections
};

Wall.prototype.getProjection = function(point, segment) {
  if (segment < 0 || segment >= this.path.length - 1) {
    throw 'Segment out of bounds';
  }
  var projection = Vec2.create();
  return Vec2.projectionToSegment(projection, point, this.path[segment], this.path[segment + 1]);
};

module.exports = Wall;
