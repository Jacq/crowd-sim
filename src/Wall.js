
var Entity = require('./Entity');

var Wall = function(path, options) {
  Entity.call(this);
  if (!path || path.length < 2) {
    throw 'Walls must have at least two points';
  }
  this.width = this.options ? options.width || 2 : 2;
  this.path = path;
};

module.exports = Wall;
