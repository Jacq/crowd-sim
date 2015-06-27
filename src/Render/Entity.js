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

Entity.mouseover = function(e) {
  //var entity = this._entityView.entityModel;
  this.hover = true;
  this.tint = 0xFFFFFF;
};

Entity.mouseout = function(e) {
  //var entity = this._entityView.entityModel;
  this.hover = false;
  this.tint = 0x999999;
};

Entity.mousedown = function(e) {
  Entity.globalMousePressed = true;
  this.drag = true;
  var point = e.data.getLocalPosition(this.parent);
  if (this.entity.mousedown) {
    this.entity.mousedown(point);
  }
  var anchor = this.entity.getAnchor();
  this.mousedownAnchor = {x: anchor.x - point.x, y: anchor.y - point.y};
};

Entity.mouseup = function(e) {
  Entity.globalMousePressed = false;
  this.drag = false;
  if (this.entity.mouseup) {
    this.entity.mouseup();
  }
  this.mousedownAnchor = null;
};

Entity.mousemove = function(e) {
  if (!Entity.globalMousePressed) { // correct mouse up out of the entity
    this.drag = false;
  }
  if (this.drag) {
    var newPosition = e.data.getLocalPosition(this.parent);
    if (Entity.snapToGrid) {
      newPosition.x = Math.round(newPosition.x);
      newPosition.y = Math.round(newPosition.y);
    }
    this.entity.dragTo(newPosition,this.mousedownAnchor);
  }
};

Entity.snapToGrid = true;
Entity.globalMousePressed = false;

module.exports = Entity;
