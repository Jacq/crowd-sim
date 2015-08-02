'use strict';

var Vec2 = require('../../Common/Vec2');
var Entity = require('../Entity');
var Joint = require('./Joint');

var LinePrototype = function(id, type, defaults) {
  var Line = function(x, y, parent, options) {
    this.options = Lazy(options).defaults(defaults).toObject();
    Entity.call(this, x, y, parent, this.options);
    this.id = id + Line.id++;
    this.entities.joints = [];
    if (x && y) {
      this.addJoint(x,y,this.options.radius);
    }
  };

  Line.prototype.addEntity = function(joint, options) {
    // add a joint to the end or a given position by options.idx
    if (!options || options.previousJoint === null) {
      this.entities.joints.push(joint);
    } else {
      var idx = this.entities.joints.indexOf(options.previousJoint);
      if (idx === -1) { throw 'Previous joint not found'; }
      this.entities.joints.splice(idx, 0, joint);
    }
  };

  Line.prototype.removeEntity = function(joint) {
    var idx = this.entities.joints.indexOf(joint);
    if (idx !== -1) {
      this.entities.joints.splice(idx, 1);
      // destroy line if not contains joints
      if (this.entities.joints.length === 0) {
        this.destroy();
      }
      if (idx === 0) { // relocate reference to next joint idx +1,
        //but we removed idx alreade so next is idx
        var nextJoint = this.entities.joints[idx];
        this.pos[0] = nextJoint.pos[0];
        this.pos[1] = nextJoint.pos[1];
      }
    } else {
      throw 'Joint not found in ' + Line.type;
    }
  };

  Line.prototype.destroy = function() {
    for (var j in this.entities.joints) {
      this.entities.joints[j].destroy();
    }
    this.entities.joints.length = 0;
    Entity.prototype.destroy.call(this);
  };

  Line.prototype.addJoints = function(joints) {
    // n joints, n-1 sections
    for (var i in joints) {
      var joint = joints[i];
      var radius = null;
      if (joint.length === 2) {
        radius = joint[3];
      }
      this.addJoint(joint[0],joint[1],radius);
    }
  };

  Line.prototype.addJoint = function(x, y, options) {
    Entity.prototype.updatePos.call(this,x,y);
    options = Lazy(options).defaults({radius: this.options.radius}).toObject();
    var joint = new Joint(x, y, this, options);
    return joint;
  };

  Line.prototype.getJoints = function() {
    return this.entities.joints;
  };

  Line.prototype.getJointIdx = function(joint) {
    return this.entities.joints.indexOf(joint);
  };

  Line.prototype.getJointByIdx = function(idx) {
    return this.entities.joints[idx];
  };

  Line.prototype.getWidth = function() {
    return this.options.width;
  };

  Line.prototype.reverse = function() {
    this.entities.joints = Lazy(this.entities.joints).reverse().toArray();
  };

  Line.prototype.getProjection = function(point, segment) {
    if (segment < 0 || segment >= this.entities.joints.length - 1) {
      throw 'Segment out of bounds';
    }
    var projection = Vec2.create();
    return Vec2.projectionToSegment(projection, point, this.entities.joints[segment].pos, this.entities.joints[segment + 1].pos);
  };

  Line.id = 0;
  Line.type = type;
  return Line;
};

module.exports = LinePrototype;
