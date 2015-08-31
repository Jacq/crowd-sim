'use strict';

var Base = require('./Base');

/**
 * Base render prototype
 *
 * @class Render.Entity
 * @constructor
 * @param {Entity} entity
 */
var Entity = function(entity) {
  if (!entity) {
    throw 'Entity undefined';
  }
  this.entityModel = entity;
  this.entityModel.view = this;
  this.selected = false;
};

/**
 * Destroy entity.
 *
 * @method destroy
 */
Entity.prototype.destroy = function() {
  if (this.entityModel) {
    this.entityModel.view = null;
    this.entityModel.destroy();
    this.entityModel = null;
  }
};

/**
 * Create base grahpics.
 *
 * @method createGraphics
 * @param {Pixi.Container} container
 * @param {Pixi.Graphics} graphics , optional created otherwise
 * @return {Pixi.Graphics} graphics
 */
Entity.prototype.createGraphics = function(container, graphics) {
  if (!graphics) {
    graphics = new PIXI.Graphics();
  }
  Entity.setInteractive(graphics);
  graphics._entityView = this;
  // add it the container so we see it on our screens.
  container.addChild(graphics);
  return graphics;
};

/**
 * Destroy base graphics.
 *
 * @method destroyGraphics
 * @param {Pixi.Container} container
 * @param {Pixi.Graphics} graphics
 */
Entity.prototype.destroyGraphics = function(container, graphics) {
  if (graphics) {
    container.removeChild(graphics);
    graphics.interactive = false;
    graphics.buttonMode = false;
    graphics.destroy();
  }
};

/**
 * Set render entity as interactive.
 *
 * @method setInteractive
 * @param {Pixi.DisplayObject} displayObject
 */
Entity.setInteractive = function(displayObject) {
  displayObject.interactive = true;
  displayObject.buttonMode = true;
  displayObject.mouseover = Entity.mouseover;
  displayObject.mouseout = Entity.mouseout;
  displayObject.mousedown = Entity.mousedown;
  displayObject.mouseup = Entity.mouseup;
  displayObject.mousemove = Entity.mousemove;
};

/**
 * Animate entity.
 *
 * @method render
 * @param {Pixi.Graphics} graphics
 */
Entity.prototype.render = function(graphics) {
  //this.display.clear();
};

/**
 * Get entity position.
 *
 * @method getPos
 * @return {Vec2} position.
 */
Entity.prototype.getPos = function() {
  return this.entityModel.pos;
};

Entity.mousedown = null;
Entity.mousemove = null;
Entity.mouseup = null;
Entity.mouseover = null;
Entity.mouseout = null;

module.exports = Entity;
