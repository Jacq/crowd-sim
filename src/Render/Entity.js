'use strict';

var Base = require('./Base');

/*
* Base render prototype
*/
var Entity = function(entity) {
  if (!entity) {
    throw 'Entity undefined';
  }
  this.entityModel = entity;
  this.entityModel.extra.view = this;
  this.selected = false;
};

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

Entity.prototype.destroyGraphics = function(container, graphics) {
  if (graphics) {
    graphics.destroy();
    container.removeChild(graphics);
  }
};

Entity.setInteractive = function(displayObject) {
  displayObject.interactive = true;
  displayObject.buttonMode = true;
  displayObject.mouseover = Entity.mouseover;
  displayObject.mouseout = Entity.mouseout;
  displayObject.mousedown = Entity.mousedown;
  displayObject.mouseup = Entity.mouseup;
  displayObject.mousemove = Entity.mousemove;
};

Entity.prototype.render = function(graphics) {
  //this.display.clear();
};

Entity.prototype.destroy = function(container, graphics) {
  this.destroyGraphics(container, graphics);
};

Entity.mousedown = null;
Entity.mousemove = null;
Entity.mouseup = null;
Entity.mouseover = null;
Entity.mouseout = null;

module.exports = Entity;
