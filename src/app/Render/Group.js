'use strict';

var GroupModel = require('CrowdSim').Group;
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

/**
 * Create a group render view from a group entity.
 *
 * @class Render.Group
 * @constructor
 * @param {Group} group
 */
var Group = function(group) {
  if (!group) {
    throw 'Group object must be defined';
  }
  Entity.call(this, group);
};

/**
 * Create a group render view from a group entity.
 * @method CreateFromModel
 * @param {Group} group
 * @return {Render.Group}
 */
Group.CreateFromModel = function(group) {
  return new Group(group);
};

/**
 * Create a group render and entity in a point.
 *
 * @method CreateFromPoint
 * @param {Number} x
 * @param {Number} y
 * @param {Entity} parent
 * @param {Object} options
 * @return {Render.Group}
 */
Group.CreateFromPoint = function(x, y, parent, options) {
  var group = new GroupModel(x, y, parent, options);
  return new Group(group);
};

/**
 * Destroy render group.
 *
 * @method destroy
 */
Group.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Group.container, this.graphics);
  Entity.prototype.destroy.call(this);
};

/**
 * Create base graphics for group.
 *
 * @method createGraphics
 * @param {Group} group
 */
Group.prototype.createGraphics = function(group) {
  this.graphics = Entity.prototype.createGraphics.call(this,Group.container);
  this.label = new PIXI.Text(group.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  this.circle = new PIXI.Circle(group.pos[0], group.pos[1], group.getRadius());
  this.circle.entityModel = group;
  this.graphics.entity = this;
};

/**
 * Animate group, update position and radius.
 *
 * @method render
 * @param {Object} options of the group
 * @return
 */
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
    var color  = this.hover ? Colors.Hover : (group.options.agentsAspect || Colors.Group);
    this.graphics.beginFill(color, this.hover ? 0.9 : 0.3);
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
      if (start) {
        this.graphics.lineTo(start.pos[0],start.pos[1]);
      }
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

/**
 * Get render group anchor.
 *
 * @method getAnchor
 * @return {Vec2} anchor
 */
Group.prototype.getAnchor = function() {
  var group = this.entityModel;
  return {x: group.pos[0], y: group.pos[1]};
};

/**
 * Drag action in groups.
 *
 * @method dragTo
 * @param {Vec2} pos
 * @param {Vec2} anchor
 */
Group.prototype.dragTo = function(pos, anchor) {
  var group = this.entityModel;
  group.pos[0] = pos.x;
  group.pos[1] = pos.y;
};

/**
 * Get group position.
 *
 * @method getPos
 * @return {Vec2} position
 */
Group.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

/**
 * Get associated group entity.
 *
 * @method getGroup
 * @return {Group}
 */
Group.prototype.getGroup = function() {
  return this.entityModel;
};

Group.detail = new Detail(2,2);

module.exports = Group;
