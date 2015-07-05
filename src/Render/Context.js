'use strict';

var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Context = function(context, container) {
  if (!context) {
    throw 'Context object must be defined';
  }
  Entity.call(this, context);
};

Context.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Context.container, this.graphics);
};

Context.prototype.createGraphics = function(context) {
  this.graphics = Entity.prototype.createGraphics.call(this,Context.container);
  this.rect = new PIXI.Rectangle(0, 0, 0, 0);
  this.label = new PIXI.Text(context.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  this.rect.entityModel = context;
  this.graphics.entity = this;
};

Context.prototype.getAnchor = function(init) {
  var context = this.entityModel;
  return {x: context.x, y: context.y};
};

Context.prototype.mousedown = function(init) {

};

Context.prototype.dragTo = function(pos, anchor) {
  var context = this.entityModel;
  context.x = pos.x - context.width / 2;
  context.y = pos.y - context.height / 2;
};

Context.prototype.mouseup = function(init) {

};

Context.prototype.render = function(options) {
  if (!Context.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var context = this.entityModel;
  // init render
  if (!this.graphics && Context.detail.level) {
    this.createGraphics(context);
  } else {
    this.graphics.clear();
  }

  if (Context.detail.level > 0) {
    this.rect.x = context.x;
    this.rect.y = context.y;
    this.rect.width = context.width;
    this.rect.height = context.height;
    this.label.x = context.x + context.width / 2 - this.label.width / 2;
    this.label.y = context.y + context.height / 2 - this.label.height / 2;
    this.graphics.beginFill(this.graphics.hover ? Colors.Hover : Colors.Context, this.graphics.hover ? 0.9 : 0.2);
    this.graphics.drawShape(this.rect);
    this.graphics.endFill();
  }
};

Context.detail = new Detail(2);

module.exports = Context;
