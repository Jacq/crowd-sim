var Vec2 = require('../Common/Vec2');

/**
 * Module with all the entities
 *
 * @module CrowdSim
 * @submodule Entities
*/

/**
 * Base entity
 *
 * @class Entity
 * @module Entities
 * @submodule Entity
 * @constructor
 * @param {Number} x coordinate
 * @param {Number} y coordinate
 * @param {Entity} parent
 * @param {Object} options
 */
var Entity = function(x, y, parent, options) {
  this.extra = {}; // for extra information, e.g. render object
  this.pos = Vec2.fromValues(x, y);
  this.entities = {}; // stores diferent structures with related entities
  this.children = {}; // stores children entities
  this.view = null; // to store references to render objects
  if (parent) {
    this.parent = parent;
    // request add to parent the entity
    this.parent.addEntity(this, options);
  }
};

/**
 * Description
 * @method calcNewId
 * @param {} id
 * @return CallExpression
 */
Entity.prototype.calcNewId = function(id) {
  return Math.max(id + 1, Number(this.id.substring(1)) + 1);
};

/**
 * Description
 * @method destroy
 * @return
 */
Entity.prototype.destroy = function() {
  if (this.parent) {
    // request to parent removal of entity
    this.parent.removeEntity(this);
  }
};

/**
 * Description
 * @method updatePos
 * @param {} x
 * @param {} y
 * @return
 */
Entity.prototype.updatePos = function(x, y) {
  this.pos[0] = x;
  this.pos[1] = y;
};

// To add a children entity
/**
 * Description
 * @method addEntity
 * @param {} joint
 * @return
 */
Entity.prototype.addEntity = function(joint) {};

// To request remove of a children entity
/**
 * Description
 * @method removeEntity
 * @param {} joint
 * @return
 */
Entity.prototype.removeEntity = function(joint) {};

module.exports = Entity;
