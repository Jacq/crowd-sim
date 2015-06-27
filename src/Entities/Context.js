
var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');

var Context = function(x, y, world, options) {
  Entity.call(this, x, y);
  this.id = 'C' + Context.id++;
  this.mobility = 1;
  this.hazardLevel = 0;
  this.width = options ? options.width : 10;
  this.height = options ? options.height : 10;
  this.x = x - this.width / 2;
  this.y = y - this.height / 2;
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
