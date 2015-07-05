'use strict';

var Entity = require('./Entity');
var Joint = require('./Joint');

var Path = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = 'P' + Path.id++;
  this.width = options ? options.width || 0.2 : 0.2;
  var globalRadius = options ? options.radius || 4 : 4;
  if (options && options.waypoints) {
    this.wps = [];
    for (var i in options.waypoints) {
      var wp = options.waypoints[i];
      var radius = wp.length === 3 ? wp[2] : globalRadius; // global radius or given one for joint
      this.wps.push(new Joint(wp[0], wp[1], world, {radius: radius}));
    }
  }else {
    this.wps = [new Joint(x, y, world, {radius: globalRadius})];
  }
};

Path.prototype.reverse = function() {
  this.wps = Lazy(this.wps).reverse().toArray();
};

Path.prototype.addWaypoint = function(x, y, radius) {
  if (!radius) {
    radius = this.wps[this.wps.length - 1].radius;
  }
  var wp = new Joint(x, y, this.world, {radius: radius});
  this.wps.push(wp);
  return wp;
};

Path.id = 0;
Path.type = 'path';

module.exports = Path;
