
var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');

var Context = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = 'C' + Context.id++;
  this.options = Lazy(options).defaults(Context.defaults).toObject();
};

Context.prototype.setArea = function(x, y) {
  this.options.width = Math.abs(this.pos[0] - x);
  this.options.height = Math.abs(this.pos[1] - y);
};

Context.prototype.getWidth = function() {
  return this.options.width;
};

Context.prototype.getHeight = function() {
  return this.options.height;
};

Context.prototype.getRandomPoint = function() {
  var x = this.pos[0] + Math.random() * this.options.width;
  var y = this.pos[1] + Math.random() * this.options.height;
  return Vec2.fromValues(x, y);
};

Context.prototype.in = function(pos) {
  var isIn = (this.pos[0] < pos[0] && pos[0] < (this.pos[0] + this.options.width)) && (this.pos[1] < pos[1] && pos[1] < (this.pos[1] + this.options.height));
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
