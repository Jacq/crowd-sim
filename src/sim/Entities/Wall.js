

var LinePrototype = require('./Helpers/LinePrototype');

/**
 * @module Entities
 * @submodule Wall
 */
var Wall = LinePrototype('W','wall',{
  width: 0.2,
  radius: 1,
  scalable: false
});
Wall.id = 0;

module.exports = Wall;
