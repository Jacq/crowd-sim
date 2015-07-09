
var Vec2 = require('../Common/Vec2');
var Entity = require('./Entity');
var Joint = require('./Joint');

var Wall = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = Wall.id++;
  this.options = Lazy(options).defaults(Wall.defaults).toObject();
  // n joints, n-1 sections
  if (options && options.path) {
    this.path = [];
    for (var i in options.path) {
      var p = options.path[i];
      this.path.push(new Joint(p[0], p[1], world, {radius: this.getCornerWidth()}));
    }
  } else {
    this.path = [new Joint(x, y, world, {radius: this.getCornerWidth()})];
  }
};

Wall.prototype.getCornerWidth = function() {
  return this.options.width * 2;
};

Wall.prototype.getWidth = function() {
  return this.options.width;
};

Wall.prototype.getProjection = function(point, segment) {
  if (segment < 0 || segment >= this.path.length - 1) {
    throw 'Segment out of bounds';
  }
  var projection = Vec2.create();
  return Vec2.projectionToSegment(projection, point, this.path[segment].pos, this.path[segment + 1].pos);
};

Wall.prototype.addPath = function(x, y) {
  Entity.prototype.updatePos.call(this,x,y);
  var joint = new Joint(x, y, this.world, {radius: this.getCornerWidth()});
  this.path.push(joint);
  return joint;
};

Wall.defaults = {
  width: 0.2
};
Wall.id = 0;
Wall.type = 'wall';

module.exports = Wall;
