'use strict';

var Base = require('./Base');
var Entity = Base.Entity;
var Colors = Base.Colors;

var Path = function(path, container) {
  Entity.call(this, path);
};

Path.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Path.container, this.graphics);
  this.destroyGraphics(Path.container);
};

Path.prototype.createGraphics = function(path) {
  var wps = path.wps;
  if (wps && wps.length > 0) {
    this.joints = [];
    for (var i in wps) {
      var wp = wps[i];
      var circle = new PIXI.Circle(wp.pos[0], wp.pos[1], wp.radius);
      this.joints.push(circle);
    }
  }
  this.graphics = Entity.prototype.createGraphics.call(this,Path.container);
};

Path.prototype.render = function(options) {
  if (!Path.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this);
  var path = this.entityModel;
  // init render
  if (!this.graphics && Path.detail.level > 0) {
    this.createGraphics(path);
  } else {
    this.graphics.clear();
  }

  if (this.joints && this.joints.length > 0) {
    if (Path.detail.level > 0) {
      this.graphics.lineStyle(0.1, Colors.Path);
      this.graphics.moveTo(this.joints[0].x, this.joints[0].y);
      for (var lj = 1; lj < this.joints.length; lj++) {
        this.graphics.lineTo(this.joints[lj].x, this.joints[lj].y);
      }
    }
    //this.display.beginFill(Colors.Joint);
    if (Path.detail.level > 1) {
      for (var j in this.joints) {
        this.graphics.drawShape(this.joints[j]);
      }
    }
    //this.display.endFill();

  }
};

Path.detail = new Base.DetailManagement(2);

module.exports = Path;
