'use strict';

var Entity = require('./Entity');

var Path = function(waypoints, options) {
  Entity.call(this);
  if (!waypoints || waypoints.length < 2) {
    throw 'Waypoints must have at least two points';
  }
  this.id = Path.id++;
  this.width = options ? options.width || 0.2 : 0.2;
  this.wps = waypoints;
};

Path.prototype.reverse = function() {
  this.wps = Lazy(this.wps).reverse().toArray();
};

Path.id = 0;

module.exports = Path;
