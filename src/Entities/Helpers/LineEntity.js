'use strict';

var Entity = require('../Entity');
var Joint = require('./Joint');

var LineEntity = function(id, type) {
  var Line = function(x, y, parent, options) {
    Entity.call(this, x, y, parent);
    this.id = 'P' + Line.id++;
    this.options = Lazy(options).defaults(Line.defaults).toObject();
    this.entities.joints = [];
    if (x && y) {
      this.addJoint(x,y,this.options.radius);
    }
  };

  Line.prototype.addEntity = function(joint) {
    this.entities.joints.push(joint);
  };

  Line.prototype.removeEntity = function(joint) {
    var idx = this.entities.joints.indexOf(joint);
    if (idx !== -1) {
      this.entities.joints.splice(idx, 1);
      if (this.entities.joints.length === 0) {
        this.destroy();
      }
    } else {
      throw 'Joint not found in wall';
    }
  };

  Line.prototype.destroy = function() {
    Lazy(this.entities.joints).each(function(j) {
      j.destroy();
    });
    this.entities.joints.length = 0;
    Entity.prototype.destroy.call(this);
  };

  Line.prototype.addJoints = function(joins) {
    for (var i in joins) {
      var wp = joins[i];
      var radius = null;
      if (wp.length === 2) {
        radius = wp[3];
      }
      this.addJoint(wp[0],wp[1],radius);
    }
  };

  Line.prototype.addJoint = function(x, y, radius) {
    Entity.prototype.updatePos.call(this,x,y);
    if (!radius) {
      radius = this.entities.joints.length === 0 ? this.options.radius : this.entities.joints[this.entities.joints.length - 1].radius;
    }
    var wp = new Joint(x, y, this, {radius: radius});
    return wp;
  };

  Line.prototype.destroyWaypoint = function(wp) {
    var idx = this.entities.joints.indexOf(wp);
    if (idx > -1) {
      wp.destroy();
      this.entities.joints.splice(idx,1);
    } else {
      throw 'Joint not joint in Line';
    }
  };

  Line.prototype.getWaypoints = function() {
    return this.entities.joints;
  };

  Line.prototype.getWidth = function() {
    return this.options.width;
  };

  Line.prototype.reverse = function() {
    this.entities.joints = Lazy(this.entities.joints).reverse().toArray();
  };

  Line.defaults = {
    width: 0.2,
    radius: 4
  };

  Line.id = 0;
  Line.type = 'line';
};

module.exports = LineEntity;
