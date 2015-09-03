'use strict';

var Vec2 = require('CrowdSim').Vec2;
var Base = require('./Base');
var Detail = require('./Detail');
var Colors = Base.Colors;

/**
 * Agent render view.
 *
 * @class Agent
 * @module Render
 * @submodule Agent
 * @method Agent
 * @param {Agent} agent
 */
var Agent = function(agent) {
  if (!agent) {
    throw 'Agent object must be defined';
  }
  this.entityModel = agent;
  this.entityModel.view = this;
  this.sprite = new PIXI.Sprite(Agent.texture);
  Agent.container.addChild(this.sprite);
  this.sprite.visible = Agent.detail.level > 0;
  this.sprite.anchor.set(0.5);
  //this.display.alpha = 0.5;
  this.sprite.tint = agent.getAspect();
  this.sprite.height = agent.size;
  this.sprite.width = agent.size;
  this.sprite.position.x = agent.pos[0];
  this.sprite.position.y = agent.pos[1];
};

/**
 * Destroy agent.
 *
 * @method destroy
 */
Agent.prototype.destroy = function() {
  this.sprite.destroy();
  Agent.container.removeChild(this.sprite);
  if (this.graphics) {
    this.graphics.destroy();
    Agent.debugContainer.removeChild(this.graphics);
  }
};

/**
 * Animate agent.
 *
 * @method render
 */
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

  var e = this.entityModel;
  this.sprite.position.set(e.pos[0], e.pos[1]);
  this.sprite.rotation = Math.atan2(e.vel[1], e.vel[0]) - Math.PI / 2;

  if (Agent.detail.level > 1) {
    if (!this.graphics) {
      this.graphics = new PIXI.Graphics();
      Agent.debugContainer.addChild(this.graphics);
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
  if (e.debug) {
    if (Agent.detail.level > 3 && e.debug.forces) {
      var force = Vec2.create();
      for (var f in e.debug.forces) {
        this.graphics.lineStyle(0.1, Colors.Forces[f]);
        this.graphics.moveTo(e.pos[0], e.pos[1]);
        Vec2.normalize(force, e.debug.forces[f]);
        this.graphics.lineTo(e.pos[0] + force[0], e.pos[1] + force[1]);
      }
    }
    if (isNaN(e.pos[0]) || isNaN(e.pos[1])) {
      throw 'Agent position undefined';
    }
  }
};

Agent.texture = null; // agents texture
Agent.debugContainer = null; // special container use to render all agents, e.g particleContainer
Agent.detail = new Detail(4);

module.exports = Agent;
