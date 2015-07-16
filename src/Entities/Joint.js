var Entity = require('./Entity');

var Joint = function(x, y, parent, options) {
  Entity.call(this, x, y, parent);
  this.id = 'J' + Joint.id++;
  this.options = Lazy(options).defaults(Joint.defaults).toObject();
};

Joint.prototype.getRadius = function() {
  return this.options.radius;
};

Joint.defaults = {
  radius: 4
};
Joint.id = 0;
Joint.type = 'joint';

module.exports = Joint;
