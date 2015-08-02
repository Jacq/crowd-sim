var Entity = require('../Entity');

var Joint = function(x, y, parent, options) {
  this.options = Lazy(options).defaults(Joint.defaults).toObject();
  Entity.call(this, x, y, parent, this.options);
  delete this.options.previousJoint; // delete not neccesary
  this.id = 'J' + Joint.id++;
};

Joint.prototype.destroy = function() {
  this.parent.removeEntity(this);
};

Joint.prototype.getRadius = function() {
  return this.options.radius;
};

Joint.defaults = {
  radius: 4,
  previousJoint: null
};
Joint.id = 0;
Joint.type = 'joint';

module.exports = Joint;
