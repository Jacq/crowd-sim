'use strict';

var Entity = require('./Entity');
var Joint = require('./Joint');

var Path = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = 'P' + Path.id++;
  this.options = Lazy(options).defaults(Path.defaults).toObject();
  if (options && options.waypoints) {
    this.wps = [];
    for (var i in options.waypoints) {
      var wp = options.waypoints[i];
      var radius = wp.length === 3 ? wp[2] : this.options.radius; // global radius or given one for joint
      this.wps.push(new Joint(wp[0], wp[1], world, {radius: radius}));
    }
  }else {
    this.wps = [new Joint(x, y, world, {radius: this.options.radius})];
  }
};

Path.prototype.getWidth = function() {
  return this.options.width;
};

Path.prototype.reverse = function() {
  this.wps = Lazy(this.wps).reverse().toArray();
};

Path.prototype.addWaypoint = function(x, y, radius) {
  Entity.prototype.updatePos.call(this,x,y);
  if (!radius) {
    radius = this.wps[this.wps.length - 1].radius;
  }
  var wp = new Joint(x, y, this.world, {radius: radius});
  this.wps.push(wp);
  return wp;
};

Path.defaults = {
  width: 0.2,
  radius: 4
};
Path.id = 0;
Path.type = 'path';

module.exports = Path;
