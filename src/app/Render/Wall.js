'use strict';

var WallModel = require('CrowdSim').Wall;
var Base = require('./Base');
var Entity = require('./Entity');
var LinePrototype = require('./LinePrototype');
var Detail = require('./Detail');
var Colors = Base.Colors;
var Fonts = Base.Fonts;

var Wall = LinePrototype(Colors.Wall);

/**
 * Wall render view.
 *
 * @class Wall
 * @module Render
 * @submodule Wall
 * @constructor
 * @param {Wall} wall
 * @return {Wall}
 */
Wall.CreateFromModel = function(wall) {
  return new Wall(wall);
};

/**
 * Description
 * @method CreateFromPoint
 * @param {} x
 * @param {} y
 * @param {} parent
 * @param {} options
 * @return NewExpression
 */
Wall.CreateFromPoint = function(x, y, parent, options) {
  var wall = new WallModel(x, y, parent, options);
  return new Wall(wall);
};

/**
 * Description
 * @method getPos
 * @return CallExpression
 */
Wall.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

Wall.texture = null; // wall joints texture
Wall.detail = new Detail(2);

module.exports = Wall;
