'use strict';

var Vec2 = require('CrowdSim').Vec2;
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

/**
 * Joint render view
 *
 * @class Joint
 * @constructor
 * @module Render
 * @submodule Joint
 * @param {Joint} joint
 * @param {Pixi.Texture} texture
 */
var Joint = function(joint, texture) {
  if (!joint) {
    throw 'Joint object must be defined';
  }
  Entity.call(this, joint);
  this.texture = texture;
};

/**
 * Destroy base graphics.
 *
 * @method destroy
 * @param {Pixi.Graphics} graphics
 */
Joint.prototype.destroy = function(graphics) {
  var line = this.entityModel.parent;
  this.graphics.removeChild(this.label);
  //this.label.destroy();
  Entity.prototype.destroyGraphics.call(this, this.graphics , this.sprite);
  Entity.prototype.destroy.call(this);
};

/**
 * Create base graphics.
 *
 * @method createGraphics
 * @param {Pixi.Graphics} graphics
 */
Joint.prototype.createGraphics = function(graphics) {
  this.graphics = graphics;
  var joint = this.entityModel;
  //this.label = new PIXI.Text(joint.id, Base.Fonts.default);
  //this.label.resolution = Base.Fonts.resolution;
  //graphics.addChild(this.label);
  this.sprite = new PIXI.Sprite(this.texture);
  Entity.prototype.createGraphics.call(this, graphics, this.sprite);
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.sprite.entity = this;
  this.sprite.alpha = 0.5;
  this.render();
};

/**
 * Animate joint, update position and radius.
 *
 * @method render
 */
Joint.prototype.render = function() {
  this.sprite.visible = true;
  this.sprite.alpha = 0.5;
  this.sprite.x = this.entityModel.pos[0];
  this.sprite.y = this.entityModel.pos[1];
  this.sprite.width = 2 * this.entityModel.getRadius();
  this.sprite.height = 2 * this.entityModel.getRadius();
  this.sprite.tint = this.hover ? Colors.Hover : Colors.Joint;
  //this.label.x = this.sprite.x - this.label.width / 3;
  //this.label.y = this.sprite.y - this.label.height / 2;
};

/**
 * Get joint anchor for dragging actions.
 *
 * @method getAnchor
 * @return {Vec2} anchor
 */
Joint.prototype.getAnchor = function() {
  return {x: this.entityModel.pos[0], y: this.entityModel.pos[1]};
};

/**
 * Draggin actino.
 *
 * @method dragTo
 * @param {Vec2} pos
 * @param {Vec2} anchor
 */
Joint.prototype.dragTo = function(pos, anchor) {
  var anchorV2 = Vec2.fromValues(anchor.x,anchor.y);
  var radius = Vec2.length(anchorV2);
  var posV2 = Vec2.fromValues(pos.x,pos.y);
  Vec2.subtract(posV2,posV2,this.entityModel.pos);
  var newRadius = Vec2.length(posV2);
  // drag to new position
  this.entityModel.pos[0] = pos.x;
  this.entityModel.pos[1] = pos.y;
  this.sprite.x = pos.x;
  this.sprite.y = pos.y;
};

/**
 * Get joint associated entity.
 *
 * @method getJoint
 * @return {Joint} joint
 */
Joint.prototype.getJoint = function() {
  return this.entityModel;
};

/**
 * Get joint position.
 *
 * @method getPos
 * @return {Vec2} position
 */
Joint.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

/**
 * Shows or hides render joint.
 *
 * @method show
 * @param {Boolean} show true for visible
 */
Joint.prototype.show = function(show) {
  this.sprite.visible = false;
  this.sprite.alpha = 0;
};

module.exports = Joint;
