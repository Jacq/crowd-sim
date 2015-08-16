
var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');
var AssignableToGroup = require('./Helpers/Traits').AssignableToGroup;

var Context = function(x, y, parent, options, fixedId) {
  this.options = Lazy(options).defaults(Context.defaults).toObject();
  Entity.call(this, x, y, parent, this.options);
  this.id = fixedId || 'C' + Context.id++;
};

Context.prototype.destroy = function() {
  Entity.prototype.destroy.call(this);
};

Context.prototype.setArea = function(x, y) {
  this.options.width = Math.abs(this.pos[0] - x) * 2;
  this.options.height = Math.abs(this.pos[1] - y) * 2;
};

Context.prototype.incrSize = function(ds) {
  this.options.width += ds;
  this.options.height += ds;
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
Context.type = 'context';
Context = AssignableToGroup(Context);
Context.id = 0;
module.exports = Context;
