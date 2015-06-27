'use strict';

var Vec2 = require('../Common/Vec2');
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Joint = function(joint, texture, scalable) {
  this.joint = joint;
  this.texture = texture;
  this.scalable = scalable;
};

Joint.prototype.destroy = function(graphics) {
  graphics.addChild(this.sprite);
};

Joint.prototype.createGraphics = function(graphics) {
  this.sprite = new PIXI.Sprite(this.texture);
  Entity.setInteractive(this.sprite);
  this.sprite.x = this.joint.pos[0];
  this.sprite.y = this.joint.pos[1];
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.sprite.width = 2 * this.joint.radius;
  this.sprite.height = 2 * this.joint.radius;
  this.sprite.entity = this;
  this.sprite.alpha = 0.5;
  graphics.addChild(this.sprite);
};

Joint.prototype.getAnchor = function(init) {
  return {x: this.joint.pos[0], y: this.joint.pos[1]};
};

Joint.prototype.dragTo = function(pos, anchor) {
  var anchorV2 = Vec2.fromValues(anchor.x,anchor.y);
  var radius = Vec2.length(anchorV2);
  var posV2 = Vec2.fromValues(pos.x,pos.y);
  Vec2.subtract(posV2,posV2,this.joint.pos);
  var newRadius = Vec2.length(posV2);
  // calculate new size or position if dragging border or body
  if (this.scalable && newRadius >  this.joint.radius * 0.80) {
    this.joint.radius  = newRadius;
    this.sprite.width = 2 * newRadius;
    this.sprite.height = 2 * newRadius;
  } else {
    this.joint.pos[0] = pos.x;
    this.joint.pos[1] = pos.y;
    this.sprite.x = pos.x;
    this.sprite.y = pos.y;
  }
};

module.exports = Joint;
