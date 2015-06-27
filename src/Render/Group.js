'use strict';

var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Group = function(group, container) {
  Entity.call(this, group);
};

Group.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Group.container, this.graphics);
};

Group.prototype.createGraphics = function() {
  this.graphics = Entity.prototype.createGraphics.call(this,Group.container);
  this.Context = new PIXI.Rectangle(0, 0, 0, 0);
};

Group.prototype.render = function(options) {
  if (!Group.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var group = this.entityModel;
  if (!group.agents || group.agents.length === 0) {
    return;
  }
  // init render
  if (!this.graphics && Group.detail.level) {
    this.createGraphics();
  } else {
    this.graphics.clear();
  }

  if (Group.detail.level > 0) {
    //
  }
};
Group.detail = new Detail(2);

module.exports = Group;
