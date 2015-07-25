'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;
var Fonts = Base.Fonts;
var WallModel = require('../Entities/Wall');

var Wall = function(wall) {
  if (!wall) {
    throw 'Wall object must be defined';
  }
  Entity.call(this, wall, Wall.container);
};

Wall.CreateFromModel = function(wall) {
  return new Wall(wall);
};

Wall.CreateFromPoint = function(x, y, parent, options) {
  var wall = new WallModel(x, y, parent, options);
  return new Wall(wall);
};

Wall.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this, Wall.container, this.graphics);
  this.destroyGraphics(Wall.container);
  Entity.prototype.destroy.call(this);
};

Wall.prototype.createGraphics = function(wall) {
  this.graphics = Entity.prototype.createGraphics.call(this, Wall.container);
  var corners = wall.getCorners();
  for (var j in corners) {
    this.addWaypointFromModel(corners[j]);
  }
};

Wall.prototype.addWaypointFromModel = function(joint) {
  var renderJoint = new Joint(joint, Wall.texture);
  renderJoint.createGraphics(this.graphics);
  return renderJoint;
};

Wall.prototype.addCorner = function(x, y) {
  var wall = this.entityModel;
  var j = wall.addCorner(x, y);
  return this.addWaypointFromModel(j);
};

Wall.prototype.render = function(options) {
  if (!Wall.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this, this.graphics);
  var wall = this.entityModel;
  var corners = wall.getCorners();

  // init render
  if (!this.graphics && Wall.detail.level > 0) {
    this.createGraphics(wall);
  } else {
    this.graphics.clear();
    // color on hover
  }

  if (Wall.detail.level > 0) {
    this.graphics.lineStyle(wall.getWidth(), this.hover ? Colors.Hover : Colors.Wall);
    var points = [];
    for (var i = 0; i < corners.length; i++) {
      points.push(corners[i].pos[0], corners[i].pos[1]);
      corners[i].view.render();
    }
    this.graphics.drawPolygon(points);
  }
  if (Wall.detail.level > 1) {
  }
};
Wall.texture = null; // wall joints texture
Wall.detail = new Detail(2);

module.exports = Wall;
