
var Vec2 = require('../Common/Vec2');
var Entity = require('./Entity');
var Joint = require('./Joint');

var Wall = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = Wall.id++;
  this.width = options ? options.width || 0.2 : 0.2;
  // n joints, n-1 sections
  if (options && options.path) {
    this.path = [];
    for (var i in options.path) {
      var p = options.path[i];
      this.path.push(new Joint(p[0], p[1], world, {radius: this.width * 2}));
    }
  } else {
    this.path = [new Joint(x, y, world, {radius: this.width * 2})];
  }
};

Wall.prototype.getProjection = function(point, segment) {
  if (segment < 0 || segment >= this.path.length - 1) {
    throw 'Segment out of bounds';
  }
  var projection = Vec2.create();
  return Vec2.projectionToSegment(projection, point, this.path[segment].pos, this.path[segment + 1].pos);
};

Wall.prototype.addPath = function(x, y) {
  var joint = new Joint(x, y, this.world, {radius: this.width});
  this.path.push(joint);
  return joint;
};

Wall.id = 0;
Wall.type = 'wall';

module.exports = Wall;
