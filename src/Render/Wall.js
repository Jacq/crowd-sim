'use strict';

var Base = require('./Base');
var Entity = Base.Entity;
var Colors = Base.Colors;
var Fonts = Base.Fonts;

var Wall = function(wall, container) {
  Entity.call(this, wall, container);
};

Wall.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Wall.container, this.graphics);
};

Wall.prototype.createGraphics = function(wall) {
  this.graphics = Entity.prototype.createGraphics.call(this,Wall.container);
  this.joints = [];
  for (var j in wall.path) {
    var joint = wall.path[j];
    var circle = new PIXI.Circle(joint[0], joint[1], wall.width);
    var text = new PIXI.Text(j, Fonts.default);
    text.resolution = 12;
    text.x = joint[0];
    text.y = joint[1];
    this.graphics.addChild(text);
    this.joints.push(circle);
  }
};

Wall.prototype.render = function(options) {
  if (!Wall.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this);
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
    this.graphics.lineStyle(wall.width, wall.hover ? Colors.Hover : Colors.Wall);
    this.graphics.moveTo(path[0][0], path[0][1]);
    for (var i = 1; i < path.length ; i++) {
      this.graphics.lineTo(path[i][0], path[i][1]);
    }
    //this.display.endFill();
  }
  if (Wall.detail.level > 1) {
    this.graphics.beginFill(Colors.Joint);
    for (var j in this.joints) {
      this.graphics.drawShape(this.joints[j]);
    }
    this.graphics.endFill();
  }
};
Wall.detail = new Base.DetailManagement(2);

module.exports = Wall;
