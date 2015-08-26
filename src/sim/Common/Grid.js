'use strict';

var Grid = function(near) {
  this.near = near;
  this.grid = {};
};

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

Grid.prototype.remove = function(entities) {
  for (var i in entity) {
    var entity = entities[i];
    var key = this._key(entity);
    var bucket = this.grid[key];
    var j = bucket.indexOf(entity);
    this.grid[key].splice(j, 1);
  }
};

Grid.prototype.updateAll = function(entities) {
  this.clear();
  this.insert(entities);
};

Grid.prototype.update = function(entities) {
  this.remove(entities);
  this.insert(entities);
};

Grid.prototype.clear = function() {
  this.grid = {};
};

Grid.prototype.in = function(entity, width, height) {
  return this.neighbours(entity) ;
};

Grid.prototype.neighbours = function(entity) {
  var o = this.near / 2;
  var keys = this._keyNeighbours(entity);
  var neighbours = [];
  for (var k in keys) {
    neighbours = neighbours.concat(this.grid[keys[k]]);
  }
  return neighbours.filter(function(e) { return e;});
};

Grid.prototype._keyNeighbours = function(entity) {
  var x = Math.floor(entity.pos[0] / this.near) * this.near;
  var y = Math.floor(entity.pos[1] / this.near) * this.near;
  return [
    (x - 1) + ':' + (y + 1), x + ':' + (y + 1), (x + 1) + ':' + (y + 1),
    (x - 1) + ':' + y      , x + ':' + y      , (x + 1) + ':' + y,
    (x - 1) + ':' + (y - 1), x + ':' + (y - 1), (x + 1) + ':' + (y - 1)
  ];
};

Grid.prototype._key = function(entity) {
  var x = Math.floor(entity.pos[0] / this.near) * this.near;
  var y = Math.floor(entity.pos[1] / this.near) * this.near;
  return x + ':' + y;
};

module.exports = Grid;
