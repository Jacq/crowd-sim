
var Entity = require('./Entity');

var Waypoint = function(path, options) {
  Entity.call(this);
  if (!path || path.length < 2) {
    throw 'Waypoints must have at least two points';
  }
  this.width = this.options ? options.width || 2 : 2;
  this.path = path;
};

module.exports = Wall;
