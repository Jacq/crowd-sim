'use strict';

var Entity = require('./Entity');

var Path = function(waypoints, width) {
  Entity.call(this);
  if (!waypoints || waypoints.length < 2) {
    throw 'Waypoints must have at least two points';
  }
  this.id = Path.id++;
  this.wps = waypoints;
  this.width = width || 0.2;
};

Path.id = 0;

module.exports = Path;
