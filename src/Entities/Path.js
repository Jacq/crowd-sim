'use strict';

var Entity = require('./Entity');
var Joint = require('./Joint');

var Path = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = 'P' + Path.id++;
  this.options = Lazy(options).defaults(Path.defaults).toObject();
  this.entities.wps = [];
  if (x && y) {
    this.addWaypoint(x,y,this.options.radius);
  }
};

Path.prototype.addWaypoints = function(wps) {
  for (var i in wps) {
    var wp = wps[i];
    var radius = null;
    if (wp.length === 2) {
      radius = wp[3];
    }
    this.addWaypoint(wp[0],wp[1],radius);
  }
};

Path.prototype.addWaypoint = function(x, y, radius) {
  Entity.prototype.updatePos.call(this,x,y);
  if (!radius) {
    radius = this.entities.wps.length === 0 ? this.options.radius : this.entities.wps[this.entities.wps.length - 1].radius;
  }
  var wp = new Joint(x, y, this.world, {radius: radius});
  this.entities.wps.push(wp);
  return wp;
};

Path.prototype.getWaypoints = function() {
  return this.entities.wps;
};

Path.prototype.getWidth = function() {
  return this.options.width;
};

Path.prototype.reverse = function() {
  this.entities.wps = Lazy(this.entities.wps).reverse().toArray();
};

Path.defaults = {
  width: 0.2,
  radius: 4
};
Path.id = 0;
Path.type = 'path';

module.exports = Path;
