'use strict';

var Entity = require('./Entity');

var Path = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = 'P' + Path.id++;
  this.width = options ? options.width || 0.2 : 0.2;
  var radius = options ? options.radius || 4 : 4;
  this.x = x;
  this.y = y;
  if (options && options.waypoints) {
    this.wps = options.waypoints;
  }else {
    this.wps = [{pos: [x, y], radius: radius}];
  }
};

Path.prototype.reverse = function() {
  this.wps = Lazy(this.wps).reverse().toArray();
};

Path.prototype.addWaypoint = function(wp) {
  if (!wp.radius) {
    wp.radius = this.wps[this.wps.length - 1].radius;
  }
  this.wps.push(wp);
};

Path.id = 0;

module.exports = Path;
