'use strict';

var ContextModel = require('CrowdSim').Context;
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Context = function(context) {
  if (!context) {
    throw 'Context object must be defined';
  }
  Entity.call(this, context);
};

Context.CreateFromModel = function(context) {
  return new Context(context);
};

Context.CreateFromPoint = function(x, y, parent, options) {
  var context = new ContextModel(x, y, parent, options);
  return new Context(context);
};

Context.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Context.container, this.graphics);
  Entity.prototype.destroy.call(this);
};

Context.prototype.createGraphics = function(context) {
  this.graphics = Entity.prototype.createGraphics.call(this,Context.container);
  this.label = new PIXI.Text(context.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  this.rect = new PIXI.Rectangle(0, 0, 0, 0);
  this.rect.entityModel = context;
  this.graphics.entity = this;
};

Context.prototype.getAnchor = function(init) {
  var context = this.entityModel;
  return {x: context.pos[0], y: context.pos[1]};
};

Context.prototype.dragTo = function(pos, anchor) {
  var context = this.entityModel;
  context.pos[0] = pos.x;
  context.pos[1] = pos.y;
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
    var w = context.getWidth();
    var h = context.getHeight();
    this.rect.x = context.pos[0] - w / 2;
    this.rect.y = context.pos[1] - h / 2;
    this.rect.width = w;
    this.rect.height = h;
    this.label.x = context.pos[0] - this.label.width / 2;
    this.label.y = context.pos[1] - this.label.height / 2;
    this.graphics.beginFill(this.hover ? Colors.Hover : Colors.Context, this.hover ? 0.9 : 0.3);
    this.graphics.drawShape(this.rect);
    this.graphics.endFill();
  }
};

Context.prototype.setArea = function(x, y) {
  this.entityModel.setArea(x, y);
};

Context.prototype.getContext = function() {
  return this.entityModel;
};

Context.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

Context.detail = new Detail(2);

module.exports = Context;
