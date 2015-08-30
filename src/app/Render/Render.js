'use strict';

var Base = require('./Base');
var Colors = Base.Colors;

var Render = function(canvas, w, h, options) {
  this.options = Lazy(options).defaults(Render.defaults).toObject();
  // create a renderer instance.
  this._renderer = PIXI.autoDetectRenderer(w, h);
  this._renderer.backgroundColor = this.options.backgroundColor;
  this._renderer.autoResize = true;
  // add the renderer view element to the DOM
  canvas.appendChild(this._renderer.view);

  // create root container
  this._stage = new PIXI.Container();
  this._stage.scale.x = this.options.scale;
  this._stage.scale.y = this.options.scale; // 10pix ~ 1m
  // create agents container
  this._worldContainer = new PIXI.Container();
  if (this.options.useParticle) {
    this._agentsContainer = new PIXI.ParticleContainer(this.options.maxAgents, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });
  } else {
    this._agentsContainer = new PIXI.Container();
  }
  this._stage.addChild(this._agentsContainer);
  this._stage.addChild(this._worldContainer);

  if (this.options.debug) {
    this._debugContainer = new PIXI.Container();
    this._stage.addChild(this._debugContainer);
  }

};

Render.prototype.init = function(textures, events) {
  var baseTextures = PIXI.Texture.fromImage(textures.file),
      a = textures.agent,
      w = textures.wall,
      p = textures.path;
  Render.Agent.texture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(a[0], a[1], a[2], a[3]));
  Render.Wall.texture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(w[0], w[1], w[2], w[3]));
  Render.Path.texture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(p[0], p[1], p[2], p[3]));

  this._worldContainer.removeChildren();
  this._agentsContainer.removeChildren();
  // init default containers

  Render.Agent.container = this._agentsContainer;
  Render.Agent.debugContainer = this._debugContainer;
  Render.Context.container = this._worldContainer;
  Render.Group.container = this._worldContainer;
  Render.Wall.container = this._worldContainer;
  Render.Path.container = this._worldContainer;

  // to draw everything
  //App._renderOnce();

  this.onPreRender = events.onPreRender;
  this.onPostRender = events.onPostRender;
  // wire Entity events
  Render.Entity.mouseover = events.mouseover;
  Render.Entity.mouseout = events.mouseout;
  Render.Entity.mousedown = events.mousedown;
  Render.Entity.mouseup = events.mouseup;
  Render.Entity.mousemove = events.mousemove;

  // axis
  var graphicsAux = new PIXI.Graphics();
  graphicsAux.lineStyle(0.2, Colors.Helpers);
  // x
  var length = 5;
  graphicsAux.moveTo(0, 0);
  graphicsAux.lineTo(length, 0);
  graphicsAux.moveTo(length - 1, -1);
  graphicsAux.lineTo(length, 0);
  graphicsAux.lineTo(length - 1, 1);
  // y
  graphicsAux.moveTo(0, 0);
  graphicsAux.lineTo(0, length);
  graphicsAux.moveTo(-1, length - 1);
  graphicsAux.lineTo(0, length);
  graphicsAux.lineTo(1, length - 1);

  // for temporary graphics
  this._graphicsHelper = new PIXI.Graphics();

  this._worldContainer.addChild(this._graphicsHelper);
  this._worldContainer.addChild(graphicsAux);
  this._stop = false;
  this.animate();
};

Render.prototype.start = function() {
  this._stop = false;
  this.animate();
};

Render.prototype.animate = function() {
  if (this.onPreRender) {
    this.onPreRender();
  }
  if (this.world) {
    if (this.world.changesNumber() > 0 || this.world.freeze()) {
      // jump renders when no changes happened yet

      var entities = this.world.entities;
      // render/refresh entities
      for (var prop in entities) {
        Lazy(entities[prop]).each(function(a) {
          if (a.view) { a.view.render(); }
        });
      }
      var agents = this.world.getAgents();
      for (var i in agents) {
        agents[i].view.render();
      }
    }
  }
  // render the stage
  this._renderer.render(this._stage);
  if (!this._stop) {
    requestAnimationFrame(this.animate.bind(this));
  }
  if (this.onPostRender) {
    this.onPostRender();
  }

};

Render.prototype.stop = function() {
  this._stop = true;
};

Render.prototype.setWorld = function(world) {
  this.world = world;
};

Render.prototype.resize = function(w, h) {
  this._renderer.resize(w,h);
};

Render.prototype.drawHelperLine = function(x0, y0, x1, y1) {
  this._graphicsHelper.clear();
  if (x0) {
    this._graphicsHelper.clear();
    this._graphicsHelper.lineStyle(0.2, Colors.Helpers);
    this._graphicsHelper.moveTo(x0, y0);
    this._graphicsHelper.lineTo(x1, y1);
  }
};

Render.prototype.zoom = function(scale, x, y) {
  scale = scale > 0 ? 1.1 : 0.9;
  var currentWorldPos = this.screenToWorld(x, y);
  this._stage.scale.x = this._stage.scale.x * scale;
  this._stage.scale.y = this._stage.scale.y * scale;
  var newScreenPos = this.worldToScreen(currentWorldPos.x, currentWorldPos.y);
  this._stage.x -= (newScreenPos.x - x) ;
  this._stage.y -= (newScreenPos.y - y) ;
};

Render.prototype.pan = function(dx, dy) {
  this._stage.x += dx;
  this._stage.y += dy;
};

Render.prototype.getWidth = function() {
  return this._stage.width;
};

Render.prototype.getHeight = function() {
  return this._stage.height;
};

Render.prototype.screenToWorld = function(x, y) {
  return {x: (x - this._stage.x) / this._stage.scale.x,
          y: (y - this._stage.y) / this._stage.scale.y};
};
Render.prototype.worldToScreen = function(x, y) {
  return {x: x * this._stage.scale.x + this._stage.x,
          y: y * this._stage.scale.y + this._stage.y};
};

Render.Agent = require('./Agent');
Render.Entity = require('./Entity');
Render.Group = require('./Group');
Render.Context = require('./Context');
Render.Path = require('./Path');
Render.Wall = require('./Wall');
Render.Joint = require('./Joint');

Render.defaults = {
  backgroundColor: 0,
  useParticle: true,
  scale: 10,
  mxAgents: 5000, // to init particle container
  debug: false,
};

module.exports = Render;
