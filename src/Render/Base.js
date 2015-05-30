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
  default: {font: '2px Snippet', fill: 'white', align: 'left'}
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
  // add it the container so we see it on our screens..
  graphics.interactive = true;
  graphics.buttonMode = true;
  graphics.mouseover = Entity.mouseover;
  graphics.mouseout = Entity.mouseout;
  graphics._entityView = this;
  container.addChild(graphics);
  return graphics;
};

Entity.prototype.destroyGraphics = function(container, graphics) {
  if (graphics) {
    graphics.destroy();
    container.removeChild(graphics);
  }
};

Entity.prototype.render = function() {
  //this.display.clear();
};

Entity.prototype.destroy = function(container, graphics) {
  this.destroyGraphics(container, graphics);
};

Entity.mouseover = function() {
  var entity = this._entityView.entityModel;
  entity.hover = true;
};

Entity.mouseout = function() {
  var entity = this._entityView.entityModel;
  entity.hover = false;
};

/**
 * [function description]
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
