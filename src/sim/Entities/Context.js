
var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');
var AssignableToGroup = require('./Helpers/Traits').AssignableToGroup;

/**
 * Context entity
 *
 * @class Context
 * @module Entities
 * @submodule Context
 * @constructor
 * @param {Number} x coordinate
 * @param {Number} y coordinate
 * @param {World} parent world
 * @param {Object} [options]
 * @param {String} id to use insted of autogenerate it, used when loading worlds
 * @extends Entity
 */
var Context = function(x, y, parent, options, id) {
  this.options = Lazy(options).defaults(Context.defaults).toObject();
  this.id = id || 'C' + Context.id++;
  Context.id = Entity.prototype.calcNewId.call(this, Context.id);
  Entity.call(this, x, y, parent, this.options);
};

/**
 * Destroy the Context
 *
 * @method destroy
 */
Context.prototype.destroy = function() {
  Entity.prototype.destroy.call(this);
};

/**
 * Sets the context size.
 *
 * @method setArea
 * @param {Number} x center
 * @param {Number} y center
 */
Context.prototype.setArea = function(x, y) {
  this.options.width = Math.abs(this.pos[0] - x) * 2;
  this.options.height = Math.abs(this.pos[1] - y) * 2;
};

/**
 * Increment the context width and height.
 *
 * @method incrSize
 * @param {Number} ds increment in width and height
 */
Context.prototype.incrSize = function(ds) {
  this.options.width += ds;
  this.options.height += ds;
};

/**
 * Gets width.
 *
 * @method getWidth
 * @return {Number} width
 */
Context.prototype.getWidth = function() {
  return this.options.width;
};

/**
 * Gets height.
 *
 * @method getHeight
 * @return {Number} height
 */
Context.prototype.getHeight = function() {
  return this.options.height;
};

/**
 * Gets the context minimum X,Y coordinate.
 *
 * @method getMinXY
 * @return {Vec2} point
 */
Context.prototype.getMinXY = function() {
  var point = Vec2.create();
  var halfSize = Vec2.fromValues(this.options.width / 2, this.options.height / 2);
  return Vec2.subtract(point, this.pos, halfSize);
};

/**
 * Gets the context maximun X,Y coordinate.
 *
 * @method getMaxXY
 * @return {Vec2} point
 */
Context.prototype.getMaxXY = function() {
  var point = Vec2.create();
  var halfSize = Vec2.fromValues(this.options.width / 2, this.options.height / 2);
  return Vec2.add(point, this.pos, halfSize);
};

/**
 * Get a random point in the context.
 *
 * @method getRandomPoint
 * @return {Vec2} point
 */
Context.prototype.getRandomPoint = function() {
  var x = this.pos[0] + (Math.random() - 0.5) * this.options.width;
  var y = this.pos[1] + (Math.random() - 0.5) * this.options.height;
  return Vec2.fromValues(x, y);
};

/**
 * Get the nearest point in the context to another.
 *
 * @method getNearestPoint
 * @param {Vec2} point
 * @param {Number} border margin inside the context
 * @return {Vec2} nearest point in the context to the given point
 */
Context.prototype.getNearestPoint = function(point, border) {
  var w2 = this.options.width / 2 - this.options.width / 10; // half-width + 10% margin to avoid borders errors
  var h2 = this.options.height / 2 - this.options.height / 10;
  // all segments
  var corners = [[this.pos[0] - w2, this.pos[1] - h2], [this.pos[0] + w2, this.pos[1] - h2],
                 [this.pos[0] + w2, this.pos[1] + h2], [this.pos[0] - w2, this.pos[1] + h2],
                 [this.pos[0] - w2, this.pos[1] - h2]];
  var nearestPoint = this.pos;
  var projection = Vec2.create();
  // find shortest linear path
  var shortestProjection = Vec2.fromValues(point[0] - this.pos[0], point[1] - this.pos[1]);
  var shortestProjectionDistance = Vec2.squaredLength(shortestProjection);
  for (var c = 1; c < corners.length; c++) {
    projection = Vec2.projectionToSegment(projection, point, corners[c - 1], corners[c]);
    var distance = Vec2.squaredLength(projection);
    if (distance < shortestProjectionDistance) {
      shortestProjection = projection;
      shortestProjectionDistance = distance;
    }
  }
  return Vec2.subtract(shortestProjection,point,shortestProjection);
};

/**
 * Get context mobility factor.
 *
 * @method getMobility
 * @return {Number}
 */
Context.prototype.getMobility = function() {
  return this.options.mobility;
};

/**
 * Get context trigger option.
 *
 * @method getTrigger
 * @return {Boolean} true if contexts stops simulation on empty of agents
 */
Context.prototype.getTrigger = function() {
  return this.options.triggerOnEmpty;
};

/**
 * Check if a point is inside the context.
 *
 * @method in
 * @param {Vec2} pos
 * @return {Boolean} true if pos is inside
 */
Context.prototype.in = function(pos) {
  var w2 = this.options.width / 2;
  var h2 = this.options.height / 2;
  var isIn = (this.pos[0] - w2 < pos[0] && pos[0] < this.pos[0] + w2) &&
             (this.pos[1] - h2 < pos[1] && pos[1] < this.pos[1] + h2);
  return isIn;
};

Context.type = 'context';
Context = AssignableToGroup(Context);

Context.defaults = {
  mobility: 1,
  triggerOnEmpty: false,
  width: 10,
  height: 10
};
Context.id = 0;
module.exports = Context;
