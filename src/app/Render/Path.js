'use strict';

var PathModel = require('CrowdSim').Path;
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var LinePrototype = require('./LinePrototype');
var Colors = Base.Colors;

var Path = LinePrototype(Colors.Path);

/**
 * Create a Path render view from an Entity.
 *
 * @class Render.Path
 * @method CreateFromModel
 * @param {particleh} path
 * @return {Path} render path
 */
Path.CreateFromModel = function(path) {
  return new Path(path);
};

/**
 * Create a Path at a position.
 *
 * @method CreateFromPoint
 * @param {Number} x
 * @param {Number} y
 * @param {Entity} parent
 * @param {Object} options for creation of the path
 * @return {Path} render path
 */
Path.CreateFromPoint = function(x, y, parent, options) {
  var path = new PathModel(x, y, parent, options);
  return new Path(path);
};

/**
 * Get the path position, last joint added.
 *
 * @method getPos
 * @return {Vec2} position
 */
Path.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

Path.texture = null; // paths joint texture
Path.detail = new Detail(2);

module.exports = Path;
