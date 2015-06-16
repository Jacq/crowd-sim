'use strict';

var Base = require('./Base');
var Entity = Base.Entity;
var Colors = Base.Colors;

var Joint = function(joint, texture) {
  this.pos = joint.pos;
  this.radius = joint.radius;
  this.texture = texture;
};

Joint.prototype.destroy = function(graphics) {
  graphics.addChild(this.sprite);
};

Joint.prototype.createGraphics = function(graphics) {
  this.sprite = new PIXI.Sprite(this.texture);
  Entity.setInteractive(this.sprite);
  this.sprite.x = this.pos[0];
  this.sprite.y = this.pos[1];
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.sprite.width = this.radius;
  this.sprite.height = this.radius;
  this.sprite.entity = this;
  graphics.addChild(this.sprite);
};

Joint.prototype.dragTo = function(pos) {
  this.pos[0] = pos.x;
  this.pos[1] = pos.y;
  this.sprite.x = pos.x;
  this.sprite.y = pos.y;
};

module.exports = Joint;
