var Entity = require('../Entity');
var Vec2 = require('../../Common/Vec2');

/**
 * Joint helper entity children of Wall and Path
 *
 * @class Joint
 * @constructor
 * @param {Number} x coordinate
 * @param {Number} y coordinate
 * @param {World} parent world
 * @param {Object} [options]
 * @param {String} id to use insted of autogenerate it, used when loading worlds
 * @extends Entity
 */
var Joint = function(x, y, parent, options, id) {
  this.options = Lazy(options).defaults(Joint.defaults).toObject();
  Entity.call(this, x, y, parent, this.options);
  delete this.options.previousJoint; // delete not neccesary
  this.id = id || 'J' + Joint.id++;
  Joint.id = Entity.prototype.calcNewId.call(this, Joint.id);
};

/**
 * Destroy the Joint
 *
 * @method destroy
 */
Joint.prototype.destroy = function() {
  if (this.parent) {
    this.parent.removeEntity(this);
  }
};

/**
 * Get radius
 *
 * @method getRadius
 * @return {Number} radius
 */
Joint.prototype.getRadius = function() {
  return this.options.radius;
};

/**
 * Checks if a point is inside a joint.
 *
 * @method in
 * @param {Vec2} pos
 * @return {Boolean} true if inside; false otherwise
 */
Joint.prototype.in = function(pos) {
  var dist = Vec2.distance(pos, this.pos);
  return dist < this.options.radius;
};

/**
 * Set radius.
 *
 * @method setRadius
 * @param {Number} radius
 */
Joint.prototype.setRadius = function(radius) {
  if (this.options.scalable) {
    this.options.radius = radius;
  }
};

/**
 * Increment radius.
 *
 * @method incrRadius
 * @param {Number} dr
 */
Joint.prototype.incrRadius = function(dr) {
  if (this.options.scalable) {
    this.options.radius = Math.abs(this.options.radius + dr);
  }
};

Joint.defaults = {
  radius: 4,
  previousJoint: null,
  scalable: true
};
Joint.id = 0;
Joint.type = 'joint';

module.exports = Joint;
