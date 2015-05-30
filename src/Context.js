
var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Context = function(x, y, width, height) {
  Entity.call(this);
  this.mobility = 1;
  this.hazardLevel = 0;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
};

Context.prototype.getRandomPoint = function() {
  var x = this.x + Math.random() * this.width;
  var y = this.y + Math.random() * this.height;
  return Vec2.fromValues(x, y);
};

Context.prototype.in = function(pos) {
  var isIn = (this.x < pos[0] && pos[0] < (this.x + this.width)) && (this.y < pos[1] && pos[1] < (this.y + this.height));
  return isIn;
};

Context.id = 0;

module.exports = Context;
