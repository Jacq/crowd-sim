'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;
var PathModel = require('../Entities/Path');

var Path = function(path) {
  if (!path) {
    throw 'Path object must be defined';
  }
  Entity.call(this, path);
};

Path.CreateFromModel = function(path) {
  return new Path(path);
};

Path.CreateFromPoint = function(x, y, parent, options) {
  var path = new PathModel(x, y, parent, options);
  return new Path(path);
};

Path.prototype.destroy = function() {
  this.graphics.removeChild(this.label);
  this.label.destroy();
  Entity.prototype.destroyGraphics.call(this, Path.container, this.graphics);
  this.destroyGraphics(Path.container);
  Entity.prototype.destroy.call(this);
};

Path.prototype.createGraphics = function(path) {
  this.graphics = Entity.prototype.createGraphics.call(this, Path.container);
  this.label = new PIXI.Text(path.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  var wps = path.getWaypoints();
  this.label.x = wps[0].pos[0] - this.label.width / 2;
  this.label.y = wps[0].pos[1] - this.label.height / 2;
  if (wps && wps.length > 0) {
    for (var i in wps) {
      this.addWaypointFromModel(wps[i]);
    }
  }
};

Path.prototype.addWaypointFromModel = function(joint) {
  var renderJoint = new Joint(joint, Path.texture);
  renderJoint.createGraphics(this.graphics);
  return renderJoint;
};

Path.prototype.addWaypoint = function(x, y) {
  var path = this.entityModel;
  var wp = path.addWaypoint(x, y);
  return this.addWaypointFromModel(wp);
};

Path.prototype.render = function(options) {
  if (!Path.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this, this.graphics);
  var path = this.entityModel;
  var wps = path.getWaypoints();
  // init render
  if (!this.graphics && Path.detail.level > 0) {
    this.createGraphics(path);
  } else {
    this.graphics.clear();
  }

  if (Path.detail.level > 0) {
    var points  = [];
    this.label.x = wps[0].pos[0] - this.label.width / 2;
    this.label.y = wps[0].pos[1] - this.label.height / 2;
    this.graphics.lineStyle(path.getWidth(), this.hover ? Colors.Hover : Colors.Path, 0.6);
    for (var i = 0; i < wps.length; i++) {
      points.push(wps[i].pos[0], wps[i].pos[1]);
      wps[i].view.render();
    }
    this.graphics.drawPolygon(points);
  }
  if (Path.detail.level > 1) {
  }
};

Path.texture = null; // paths joint texture
Path.detail = new Detail(2);

module.exports = Path;
