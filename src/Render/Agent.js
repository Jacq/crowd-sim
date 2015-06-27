'use strict';

var Vec2 = require('../Common/Vec2');
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Agent = function(agent, texture) {
  //var display = new PIXI.Sprite(options.texture);

  Entity.call(this, agent);
  this.sprite = new PIXI.Sprite(texture);
  Entity.prototype.createGraphics.call(this,Agent.container, this.sprite);
  this.sprite.visible = Agent.detail.level > 0;
  this.sprite.anchor.set(0.5);
  //this.display.alpha = 0.5;
  this.sprite.height = agent.size;
  this.sprite.width = agent.size;
  this.sprite.position.x = agent.pos[0];
  this.sprite.position.y = agent.pos[1];
};

Agent.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Agent.container, this.sprite);
  Entity.prototype.destroyGraphics.call(this,Agent.container, this.graphics);
};

Agent.prototype.render = function() {
  if (!Agent.detail.level) {
    this.sprite.visible = false;
    this.sprite.alpha = 0;
    if (this.graphics) {
      this.graphics.clear();
    }
    return;
  } else {
    this.sprite.alpha = 1;
    this.sprite.visible = true;
  }
  Entity.prototype.render.call(this);

  var e = this.entityModel;
  this.sprite.position.set(e.pos[0], e.pos[1]);
  this.sprite.rotation = Math.atan2(e.vel[1], e.vel[0]) - Math.PI / 2;

  if (Agent.detail.level > 1) {
    if (!this.graphics) {
      this.graphics = Entity.prototype.createGraphics.call(this,Agent.debugContainer);
      this.circle = new PIXI.Circle(e.pos[0],e.pos[1], e.size / 2);
      //this.graphics.addChild(this.circle);
    }
    this.graphics.clear();
  }

  if (Agent.detail.level > 1) {
    if (this.circle) {
      this.circle.x = e.pos[0];
      this.circle.y = e.pos[1];
      this.graphics.lineStyle(0.1, Colors.Agent);
      this.graphics.drawShape(this.circle);
    }
  }
  if (Agent.detail.level > 2) {
    this.graphics.moveTo(e.pos[0], e.pos[1]);
    this.graphics.lineTo(e.pos[0] + e.vel[0], e.pos[1] + e.vel[1]);
  }
  if (Agent.detail.level > 3 && e.debug && e.debug.forces) {
    var force = Vec2.create();
    for (var f in e.debug.forces) {
      this.graphics.lineStyle(0.1, Colors.Forces[f]);
      this.graphics.moveTo(e.pos[0], e.pos[1]);
      Vec2.normalize(force, e.debug.forces[f]);
      this.graphics.lineTo(e.pos[0] + force[0], e.pos[1] + force[1]);
    }
  }
};

Agent.debugContainer = null; // special container use to render all agents, e.g particleContainer
Agent.detail = new Detail(4);

module.exports = Agent;
