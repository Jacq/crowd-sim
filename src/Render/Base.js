'use strict';

var Colors = {
  Hover: 0x646729,
  Context: 0xe1eca0,
  Agent: 0xFF0000,
  Wall: 0x00FF00,
  Joint: 0xFFFFFF,
  Path: 0xe00c7b,
  Waypoint: 0x7a7a7a,
  Forces: {desired: 0xfffff,
          agents: 0xFF0000,
          walls: 0xc49220
          }
};

var Fonts = {
  default: {font: '2px Mono monospace', fill: Colors.Wall,
  align: 'center'}
};

/*
* Base render prototype
*/
var Entity = function(entity) {
  if (!entity) {
    throw 'Entity undefined';
  }
  this.entityModel = entity;
  this.entityModel.extra.view = this;
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

Entity.prototype.render = function() {
  //this.display.clear();
};

Entity.prototype.destroy = function(container, graphics) {
  this.destroyGraphics(container, graphics);
};

Entity.snapToGrid = true;

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
  this.drag = true;
};

Entity.mouseup = function(e) {
  this.drag = false;
};

Entity.mousemove = function(e) {
  if (this.drag) {
    var newPosition = e.data.getLocalPosition(this.parent);
    if (Entity.snapToGrid) {
      newPosition.x = Math.round(newPosition.x);
      newPosition.y = Math.round(newPosition.y);
    }
    this.entity.dragTo(newPosition);
  }
};

/**
 * [function description]
 *
 * @param  {[type]} maxDetail [description]
 * @param  {[type]} detail    [description]
 * @return {[type]}           [description]
 */
var DetailManagement = function(maxDetail, detail) {
  this.maxDetail = maxDetail;
  this.level = detail || 1;
};

DetailManagement.prototype.cycleDetail = function(detail) {
  if (detail) {
    this.level = detail;
  } else {
    this.level ++;
    if (this.level > this.maxDetail) {
      this.level = 0;
    }
  }
};

module.exports.Entity = Entity;
module.exports.Colors = Colors;
module.exports.Fonts = Fonts;
module.exports.DetailManagement = DetailManagement;
