'use strict';

var Entity = require('./Entity');
var Joint = require('./Joint');

var Path = function(x, y, parent, options) {
  Entity.call(this, x, y, parent);
  this.id = 'P' + Path.id++;
  this.options = Lazy(options).defaults(Path.defaults).toObject();
  this.entities.wps = [];
  if (x && y) {
    this.addWaypoint(x,y,this.options.radius);
  }
};

Path.prototype.destroy = function() {
  Lazy(this.entities.wps).each(function(j) {
    j.destroy();
  });
  this.entities.wps.length = 0;
  Entity.prototype.destroy.call(this);
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
  var wp = new Joint(x, y, this, {radius: radius});
  return wp;
};

Path.prototype.addEntity = function(joint) {
  this.entities.wps.push(joint);
};

Path.prototype.destroyWaypoint = function(wp) {
  var idx = this.entities.wps.indexOf(wp);
  if (idx > -1) {
    wp.destroy();
    this.entities.wps.splice(idx,1);
  } else {
    throw 'Joint not joint in path';
  }
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
