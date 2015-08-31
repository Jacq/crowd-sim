'use strict';

var Vec2 = require('./Vec2');

/**
 * Grid hashmap to store entities indexed by their position.
 *
 * @class Grid
 * @constructor
 * @param {Number} near is the cell size for the hashmap. Also the maximum distance to be consider "neighbours"
 */
var Grid = function(near) {
  this.near = near;
  this.grid = {};
};

/**
 * Insert entities in the hashmap.
 *
 * @method insert
 * @param {Array} entities
 */
Grid.prototype.insert = function(entities) {
  for (var i in entities) {
    var entity = entities[i];
    var key = this._key(entity);
    if (this.grid.hasOwnProperty(key)) {
      this.grid[key].push(entity);
    } else {
      this.grid[key] = [entity];
    }
  }
};

/**
 * Insert one entity.
 *
 * @method insertOne
 * @param {Entity} entity
 * @param {Number} x coordinate, if null entity.pos[0] is used
 * @param {Number} y coordinate, if null entity.pos[1] is used
 */
Grid.prototype.insertOne = function(entity, x, y) {
  var key = this._key(entity, x, y);
  if (this.grid.hasOwnProperty(key)) {
    this.grid[key].push(entity);
  } else {
    this.grid[key] = [entity];
  }
};

/**
 * Helper to update multiple contexts area points by sampling their area with the cell size.
 *
 * @method updateContextsHelper
 * @param {Array} contexts
 */
Grid.prototype.updateContextsHelper = function(contexts) {
  this.grid = {};
  for (var i in contexts) {
    var context = contexts[i];
    var init = context.getMinXY();
    var end = context.getMaxXY();
    // generate samples from context to insert into grid
    for (var x = init[0]; x <= end[0]; x += this.near) {
      for (var y = init[1]; y <= end[1]; y += this.near) {
        this.insertOne(context, x, y);
      }
    }
  }
};

/**
 * Helper to update multiple walls area points by sampling their path with the cell size.
 *
 * @method updateWallsHelper
 * @param {Array} walls
 */
Grid.prototype.updateWallsHelper = function(walls) {
  this.grid = {};
  for (var w in walls) {
    var wall = walls[w];
    var joints = wall.getJoints();
    if (joints.length > 0) {
      var point = Vec2.create();
      var squareStep = 2 * this.near * this.near; // sample step to ensure that line cross region at least half square
      for (var j = 1; j < joints.length; j++) {
        var squaredDistance = Vec2.squaredDistance(joints[j - 1].pos, joints[j].pos);
        var samples = Math.floor(squaredDistance / squareStep);
        for (var s = 0; s < samples; s++) {
          // generate sample of segment
          Vec2.lerp(point, joints[j - 1].pos, joints[j].pos, s / samples);
          this.insertOne(wall, point[0], point[1]);
        }
      }
    }
  }
};

/**
 * Clear the hashamp and insert entities.
 *
 * @method updateAll
 * @param {Array} entities
 */
Grid.prototype.updateAll = function(entities) {
  this.clear();
  this.insert(entities);
};

/**
 * Update given entities mapping.
 *
 * @method update
 * @param {Array} entities
 */
Grid.prototype.update = function(entities) {
  this.remove(entities);
  this.insert(entities);
};

/**
 * Clear the hashmap.
 *
 * @method clear
 */
Grid.prototype.clear = function() {
  this.grid = {};
};

/**
 * Remove the given entities.
 *
 * @method remove
 * @param {Array} entities
 */
Grid.prototype.remove = function(entities) {
  for (var i in entity) {
    var entity = entities[i];
    var key = this._key(entity);
    var bucket = this.grid[key];
    var j = bucket.indexOf(entity);
    this.grid[key].splice(j, 1);
  }
};

/**
 * Gets neighbours to (x,y) point or Entity.
 * @method neighbours
 * @param {Entity} entity
 * @param {Number} x coordinate, if null entity.pos[0] is used
 * @param {Number} y coordinate, if null entity.pos[1] is used
 * @return {LazySequence} neighbours
 */
Grid.prototype.neighbours = function(entity, x, y) {
  var that = this;
  var o = this.near / 2;
  x = x || entity.pos[0];
  y = y || entity.pos[1];
  var keys = this._keyNeighbours(x, y);
  // find neighbours in hashmap looking in all buckets and filtering empty or duplicates
  return Lazy(keys).map(function(key) {
    return that.grid[key];
  }).flatten().filter(function(e) { return e;});
};

/**
 * Gets neighbours to a context by sampling its position with the cell size.
 *
 * @method neighboursContext
 * @param {Context} context
 * @return {LazySequence} neighbours
 */
Grid.prototype.neighboursContext = function(context) {
  // generate sampling and find entities near
  var init = context.getMinXY();
  var end = context.getMaxXY();
  var neighbours = Lazy([]);
  for (var x = init[0]; x < end[0] + this.near; x += this.near) {
    for (var y = init[1]; y < end[1] + this.near; y += this.near) {
      neighbours = neighbours.concat(this.neighbours(null, x, y));
    }
  }
  return neighbours.flatten();
};

/**
 * Builds the keys of the neighbours of the position (x,y).
 *
 * @method _keyNeighbours
 * @param  {Number} x coordinate
 * @param  {Number} y coordinate
 * @return {Array} neighbours keys
 */
Grid.prototype._keyNeighbours = function(x, y) {
  x = Math.floor(x / this.near);
  y = Math.floor(y / this.near);
  return [
    (x - 1) + ':' + (y + 1), x + ':' + (y + 1), (x + 1) + ':' + (y + 1),
    (x - 1) + ':' + y      , x + ':' + y      , (x + 1) + ':' + y,
    (x - 1) + ':' + (y - 1), x + ':' + (y - 1), (x + 1) + ':' + (y - 1)
  ];
};

/**
 * Build the key to map coordinates to the hashmap.
 *
 * @method _key
 * @param  {Entity} entity
 * @param  {Number} x coordinate, if null entity.pos[0] is used
 * @param  {Number} y coordinate, if null entity.pos[1] is used
 * @return {String} key
 */
Grid.prototype._key = function(entity, x, y) {
  // use x,y if available if not just entity position
  x = x || entity.pos[0];
  x = Math.floor(x / this.near);
  y = y || entity.pos[1];
  y = Math.floor(y / this.near);
  return x + ':' + y;
};

module.exports = Grid;
