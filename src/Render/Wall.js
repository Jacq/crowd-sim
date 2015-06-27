'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;
var Fonts = Base.Fonts;

var Wall = function(wall, texture) {
  Entity.call(this, wall, Wall.container);
  this.texture = texture;
};

Wall.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Wall.container, this.graphics);
  this.destroyGraphics(Wall.container);
};

Wall.prototype.createGraphics = function(wall, texture) {
  this.graphics = Entity.prototype.createGraphics.call(this,Wall.container);
  this.joints = [];
  for (var j in wall.path) {
    var c = wall.path[j];
    var joint = new Joint({pos: c, radius: 2 * wall.width}, this.texture);
    joint.createGraphics(this.graphics);
    this.joints.push(joint);
  }
};

Wall.prototype.render = function(options) {
  if (!Wall.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var wall = this.entityModel;
  var path = wall.path;

  // init render
  if (!this.graphics && Wall.detail.level > 0) {
    this.createGraphics(wall);
  } else {
    this.graphics.clear();
    // color on hover
  }

  if (Wall.detail.level > 0) {
    //this.display.beginFill(Colors.Wall, 0.1);
    this.graphics.lineStyle(wall.width, this.graphics.hover ? Colors.Hover : Colors.Wall);
    //this.graphics.moveTo(path[0][0], path[0][1]);
    var points = [];
    for (var i = 0; i < path.length ; i++) {
      //this.graphics.lineTo(path[i][0], path[i][1]);
      points.push(path[i][0],path[i][1]);
    }
    this.graphics.drawPolygon(points);
    //this.display.endFill();
  }
  if (Wall.detail.level > 1) {
    /*this.graphics.beginFill(this.graphics.hover ? Colors.Hover : Colors.Joint);
    for (var j in this.joints) {
      if (this.joints[j].hover) {

      }
      this.graphics.drawShape(this.joints[j].circle);
    }
    this.graphics.endFill();*/
  }
};

Wall.prototype.addPath = function(point) {
  var wall = this.entityModel;
  wall.addPath(point);
  var joint = new Joint({pos: point, radius: 2 * wall.width}, this.texture);
  joint.createGraphics(this.graphics);
  this.joints.push(joint);
};

Wall.detail = new Detail(2);

module.exports = Wall;
