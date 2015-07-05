var Entity = require('./Entity');

var Joint = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = Joint.id++;
  if (options && options.radius) {
    this.radius = options.radius;
  } else {
    this.radius = 4;
  }
};

Joint.id = 0;
Joint.type = 'joint';

module.exports = Joint;
