'use strict';

var Vec2 = require('../../Common/Vec2');
var Entity = require('../Entity');
var Joint = require('./Joint');

/**
 * Base class to extend Wall and Path entities with common functionalities.
 *
 * @method LinePrototype
 * @param {String} idPrefix 'W' for walls, 'P' for paths
 * @param {String} type 'wall' for walls, 'path' for paths
 * @param {Object} defaults options
 * @param {String} id to use insted of autogenerate it, used when loading worlds
 * @return Line
 */
var LinePrototype = function(idPrefix, type, defaults, id) {
  /**
   * Line Base
   *
   * @class Line
   * @constructor
   * @param {Number} x coordinate
   * @param {Number} y coordinate
   * @param {World} parent world
   * @param {Object} [options]
   * @param {String} id to use insted of autogenerate it, used when loading world
   * @extends Entity
   */
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

  /**
   * Destroy the line
   *
   * @method destroy
   */
  Line.prototype.destroy = function() {
    for (var j in this.children.joints) {
      this.children.joints[j].parent = null;
      this.children.joints[j].destroy();
    }
    this.children.joints.length = 0;
    Entity.prototype.destroy.call(this);
  };

  /**
   * Request to add a children Joint entity.
   *
   * @method addEntity
   * @param {Joint} joint
   * @param {Object} options used for joint creation
   */
  Line.prototype.addEntity = function(joint, options) {
    // add a joint to the end or a given position by options.idx
    if (!options || options.previousJoint === null) {
      this.children.joints.push(joint);
    } else {
      var idx = this.children.joints.indexOf(options.previousJoint);
      if (idx === -1) { throw 'Previous joint not found'; }
      if (idx !== 0) { // add end
        idx++;
      }
      this.children.joints.splice(idx, 0, joint);
    }
  };

  /**
   * Request to remove a children Joint entity.
   *
   * @method removeEntity
   * @param {Joint} joint
   */
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

  /**
   * Request to add a list of  children Joint entities.
   *
   * @method addJoints
   * @param {Array} joints
   */
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

  /**
   * Helper to create a new Joint.
   *
   * @method addJoint
   * @param {Number} x
   * @param {Number} y
   * @param {Object} options
   * @param {String} id to use insted of autogenerate it, used when loading worldsid
   * @return {Joint} joint
   */
  Line.prototype.addJoint = function(x, y, options, id) {
    Entity.prototype.updatePos.call(this,x,y);
    options = Lazy(options).defaults(defaults).toObject();
    var joint = new Joint(x, y, this, options, id);
    return joint;
  };

  /**
   * Gets the childen joints.
   *
   * @method getJoints
   * @return {Array} joints
   */
  Line.prototype.getJoints = function() {
    return this.children.joints;
  };

  /**
   * Get a joint index in the path/wall
   * @method getJointIdx
   * @param {Joint} joint
   * @return {Number} index or -1 if not found
   */
  Line.prototype.getJointIdx = function(joint) {
    return this.children.joints.indexOf(joint);
  };

  /**
   * Get a joint by index in the path.
   *
   * @method getJointByIdx
   * @param {Number} idx
   * @return {Joint} joint or null
   */
  Line.prototype.getJointByIdx = function(idx) {
    return this.children.joints[idx];
  };

  /**
   * Get [options.width].
   *
   * @method getWidth
   * @return {Number} width
   */
  Line.prototype.getWidth = function() {
    return this.options.width;
  };

  /**
   * Reverse the internal joints lists.
   *
   * @method reverse
   */
  Line.prototype.reverse = function() {
    this.children.joints = Lazy(this.children.joints).reverse().toArray();
  };

  /**
   * Get the projection from a point to a given segment.
   *
   * @method getProjection
   * @param {Vec2} point
   * @param {Number} segment index
   * @return {Vec2} projection from point to segment
   */
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
