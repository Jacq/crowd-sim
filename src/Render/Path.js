'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Path = function(path) {
  if (!path) {
    throw 'Path object must be defined';
  }
  Entity.call(this, path);
};

Path.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Path.container, this.graphics);
  this.destroyGraphics(Path.container);
};

Path.prototype.createGraphics = function(path) {
  this.graphics = Entity.prototype.createGraphics.call(this,Path.container);
  this.label = new PIXI.Text(path.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  var wps = path.getWaypoints();
  this.label.x = wps[0].pos[0] - this.label.width / 2;
  this.label.y = wps[0].pos[1] - this.label.height / 2;
  if (wps && wps.length > 0) {
    this.joints = [];
    for (var i in wps) {
      var wp = wps[i];
      var joint = new Joint(wp, Path.texture);
      joint.createGraphics(this.graphics);
      this.joints.push(joint);
    }
  }
};

Path.prototype.render = function(options) {
  if (!Path.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var path = this.entityModel;
  // init render
  if (!this.graphics && Path.detail.level > 0) {
    this.createGraphics(path);
  } else {
    this.graphics.clear();
  }

  if (this.joints && this.joints.length > 0) {
    var points  = [];
    if (Path.detail.level > 0) {
      this.label.x = this.joints[0].entityModel.pos[0] - this.label.width / 2;
      this.label.y = this.joints[0].entityModel.pos[1] - this.label.height / 2;
      this.graphics.lineStyle(path.getWidth(), this.hover ? Colors.Hover : Colors.Path, 0.6);
      //this.graphics.moveTo(this.joints[0].pos[0], this.joints[0].pos[1]);
      for (var i = 0; i < this.joints.length; i++) {
        //this.graphics.lineTo(this.joints[lj].pos[0], this.joints[lj].pos[1]);
        var joint = this.joints[i].entityModel;
        points.push(joint.pos[0],joint.pos[1]);
        this.joints[i].render();
        //this.graphics.drawCircle(joint.pos[0],joint.pos[1],joint.radius);
      }
      this.graphics.drawPolygon(points);
    }
    //this.display.beginFill(Colors.Joint);
    if (Path.detail.level > 1) {
      /*for (var j in this.joints) {
        this.graphics.drawShape(this.joints[j]);
      }*/
    }
    //this.display.endFill();

  }
};

Path.prototype.addWaypoint = function(x, y) {
  var path = this.entityModel;
  var wp = path.addWaypoint(x, y);
  var joint = new Joint(wp, Path.texture);
  joint.createGraphics(this.graphics);
  this.joints.push(joint);
  return joint;
};

Path.texture = null; // paths joint texture
Path.detail = new Detail(2);

module.exports = Path;
