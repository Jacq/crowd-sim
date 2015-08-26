'use strict';

var Vec2 = require('../../Common/Vec2');
var Entity = require('../Entity');
var Joint = require('./Joint');

var LinePrototype = function(idPrefix, type, defaults, id) {
  var Line = function(x, y, parent, options, id) {
    this.options = Lazy(options).defaults(defaults).toObject();
    this.id = id || idPrefix + Line.id++;
    Line.id = Entity.prototype.calcNewId.call(this, Line.id);
    Entity.call(this, x, y, parent, this.options);
    this.children.joints = [];
    if (x && y) {
      this.addJoint(x,y,this.options);
    }
  };

  Line.prototype.destroy = function() {
    for (var j in this.children.joints) {
      this.children.joints[j].parent = null;
      this.children.joints[j].destroy();
    }
    this.children.joints.length = 0;
    Entity.prototype.destroy.call(this);
  };

  Line.prototype.addEntity = function(joint, options) {
    // add a joint to the end or a given position by options.idx
    if (!options || options.previousJoint === null) {
      this.children.joints.push(joint);
    } else {
      var idx = this.children.joints.indexOf(options.previousJoint);
      if (idx === -1) { throw 'Previous joint not found'; }
      this.children.joints.splice(idx, 0, joint);
    }
  };

  Line.prototype.removeEntity = function(joint) {
    var idx = this.children.joints.indexOf(joint);
    if (idx !== -1) {
      this.children.joints.splice(idx, 1);
      // destroy line if not contains joints
      if (this.children.joints.length === 0) {
        this.destroy();
      } else if (idx === 0 && this.children.joints.length !== 0) { // relocate reference to next joint idx +1,
        //but we removed idx alreade so next is idx
        var nextJoint = this.children.joints[idx];
        this.pos[0] = nextJoint.pos[0];
        this.pos[1] = nextJoint.pos[1];
      }
    } else {
      throw 'Joint not found in ' + Line.type;
    }
  };

  Line.prototype.addJoints = function(joints) {
    // n joints, n-1 sections
    for (var i in joints) {
      var joint = joints[i];
      var radius = this.options.radius;
      var options = Lazy(options).defaults(defaults).toObject();
      if (joint.length === 2) {
        options.radius = joint[3];
      }
      this.addJoint(joint[0],joint[1],options);
    }
  };

  Line.prototype.addJoint = function(x, y, options, id) {
    Entity.prototype.updatePos.call(this,x,y);
    options = Lazy(options).defaults(defaults).toObject();
    var joint = new Joint(x, y, this, options, id);
    return joint;
  };

  Line.prototype.getJoints = function() {
    return this.children.joints;
  };

  Line.prototype.getJointIdx = function(joint) {
    return this.children.joints.indexOf(joint);
  };

  Line.prototype.getJointByIdx = function(idx) {
    return this.children.joints[idx];
  };

  Line.prototype.getWidth = function() {
    return this.options.width;
  };

  Line.prototype.reverse = function() {
    this.children.joints = Lazy(this.children.joints).reverse().toArray();
  };

  Line.prototype.getProjection = function(point, segment) {
    if (segment < 0 || segment >= this.children.joints.length - 1) {
      throw 'Segment out of bounds';
    }
    var projection = Vec2.create();
    return Vec2.projectionToSegment(projection, point, this.children.joints[segment].pos, this.children.joints[segment + 1].pos);
  };

  Line.id = 0;
  Line.type = type;
  return Line;
};

module.exports = LinePrototype;
