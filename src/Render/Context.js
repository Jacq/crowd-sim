'use strict';

var Base = require('./Base');
var Entity = Base.Entity;
var Colors = Base.Colors;

var Context = function(context, container) {
  Entity.call(this, context);
};

Context.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Context.container, this.graphics);
};

Context.prototype.createGraphics = function() {
  this.graphics = Entity.prototype.createGraphics.call(this,Context.container);
  this.rect = new PIXI.Rectangle(0, 0, 0, 0);
};

Context.prototype.render = function(options) {
  if (!Context.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this);
  var context = this.entityModel;
  // init render
  if (!this.graphics && Context.detail.level) {
    this.createGraphics();
  } else {
    this.graphics.clear();
  }

  if (Context.detail.level > 0) {
    this.rect.x = context.x;
    this.rect.y = context.y;
    this.rect.width = context.width;
    this.rect.height = context.height;
    this.graphics.beginFill(context.hover ? Colors.Hover : Colors.Context, context.hover ? 0.9 : 0.2);
    this.graphics.drawShape(this.rect);
    this.graphics.endFill();
  }
};

Context.detail = new Base.DetailManagement(2);

module.exports = Context;
