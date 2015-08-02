'use strict';

var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;
var GroupModel = require('../Entities/Group');

var Group = function(group) {
  if (!group) {
    throw 'Group object must be defined';
  }
  Entity.call(this, group);
};

Group.CreateFromModel = function(group) {
  return new Group(group);
};

Group.CreateFromPoint = function(x, y, parent, options) {
  var group = new GroupModel(x, y, parent, options);
  return new Group(group);
};

Group.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Group.container, this.graphics);
  Entity.prototype.destroy.call(this);
};

Group.prototype.createGraphics = function(group) {
  this.graphics = Entity.prototype.createGraphics.call(this,Group.container);
  this.label = new PIXI.Text(group.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  this.circle = new PIXI.Circle(group.pos[0], group.pos[1], group.getRadius());
  this.circle.entityModel = group;
  this.graphics.entity = this;
};

Group.prototype.render = function(options) {
  if (!Group.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var group = this.entityModel;
  // init render
  if (!this.graphics && Group.detail.level) {
    this.createGraphics(group);
  } else {
    this.graphics.clear();
  }

  if (Group.detail.level > 0) {
    this.label.x = group.pos[0] - this.label.width / 3;
    this.label.y = group.pos[1] - this.label.height / 2;
    this.circle.x = group.pos[0];
    this.circle.y = group.pos[1];
    this.circle.radius = group.getRadius();
    this.graphics.beginFill(this.hover ? Colors.Hover : Colors.Group, this.hover ? 0.9 : 0.3);
    this.graphics.drawShape(this.circle);
    this.graphics.endFill();
  }
  if (Group.detail.level > 1) {
    // draw helper lines to entities
    var entities = group.entities;
    this.graphics.lineStyle(0.2, Colors.Group, 0.3);
    if (entities.path) {
      this.graphics.moveTo(group.pos[0],group.pos[1]);
      var start = entities.path.getJointByIdx(group.getPathStartIdx());
      this.graphics.lineTo(start.pos[0],start.pos[1]);
    }
    if (entities.startContext) {
      this.graphics.moveTo(group.pos[0],group.pos[1]);
      this.graphics.lineTo(entities.startContext.pos[0],entities.startContext.pos[1]);
    }
    if (entities.endContext) {
      this.graphics.moveTo(group.pos[0],group.pos[1]);
      this.graphics.lineTo(entities.endContext.pos[0],entities.endContext.pos[1]);
    }
  }
};

Group.prototype.getAnchor = function(init) {
  var group = this.entityModel;
  return {x: group.pos[0], y: group.pos[1]};
};

Group.prototype.dragTo = function(pos, anchor) {
  var group = this.entityModel;
  group.pos[0] = pos.x;
  group.pos[1] = pos.y;
};

Group.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

Group.prototype.getGroup = function() {
  return this.entityModel;
};

Group.detail = new Detail(2,2);

module.exports = Group;
