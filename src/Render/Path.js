'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = Base.Entity;
var Colors = Base.Colors;

var Path = function(path, texture) {
  Entity.call(this, path);
  this.texture = texture;
};

Path.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Path.container, this.graphics);
  this.destroyGraphics(Path.container);
};

Path.prototype.createGraphics = function(path, texture) {
  this.graphics = Entity.prototype.createGraphics.call(this,Path.container);
  var wps = path.wps;
  if (wps && wps.length > 0) {
    this.joints = [];
    for (var i in wps) {
      var wp = wps[i];
      var joint = new Joint(wp, this.texture);
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
      this.graphics.lineStyle(path.width, Colors.Path);
      this.graphics.moveTo(this.joints[0].pos[0], this.joints[0].pos[1]);
      for (var lj = 1; lj < this.joints.length; lj++) {
        this.graphics.lineTo(this.joints[lj].pos[0], this.joints[lj].pos[1]);
      }
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

Path.detail = new Base.DetailManagement(2);

module.exports = Path;
