(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var CrowdSim = require('CrowdSim');
var Render = require('./Render/Render');
var Worlds = require('./Worlds');

var App = {};

App.defaultOptions = {
  // callbacks
  debug: true,
  snapToGrid: false, // snaps the mouse position to a grid of integers
  logEvents: false,
  renderer: {
    backgroundColor: 0x000000,
    scale: 10,
    useParticle: true,
    MaxAgents: 1000, // to init particle container
    debug: true,
  },
  engine: {
    timeStepSize: 0.05,
    timeStepRun: 0.01,
    callbacks: {
      onStart: null,
      onStep: null,
      /**
       * Description
       * @method onStop
       * @param {} entity
       * @return
       */
      onStop: function(entity) {
        App.selectEntity(entity ? entity.view : null); // highlight entity that causes stop
        if (App.callbacks.onStop) {
          App.callbacks.onStop(entity);
        }
      }
    }
  },
  callbacks: {
    onPreRender: null, // before each render cycle
    onPostRender: null, // after each render cycle
    onCreateEntity: null, // on creation of complex entites
    onDestroyEntity: null, // on removing of complex entites
    onEntitySelected: null,
    onEntityUnSelected: null,
    onLoad: null, // when new world is loaded
    onSave: null, // when the current world is saved
    onStop: null, // engine stops due to a context empty
  }
};

// wire entities <=> render entities association
App.EntityTypes = {
  Agent: Render.Agent,
  Group: Render.Group,
  Context: Render.Context,
  Path: Render.Path,
  Wall: Render.Wall,
};

// wires creation of render entities from model entities
App.EntityCreationMapping = {
  'context': Render.Context,
  'group': Render.Group,
  'path': Render.Path,
  'wall': Render.Wall
};

/**
 * Description
 * @method init
 * @param {} canvas
 * @param {} options
 * @return
 */
App.init = function(canvas, options) {
  App.options = Lazy(options).defaults(App.defaultOptions).toObject();
  App.callbacks = Lazy(options.callbacks).defaults(App.defaultOptions.callbacks).toObject();

  delete App.options.callbacks;
  App.canvas = canvas;

  var w = options.width;
  var h = options.height;

  App._renderer = new Render(canvas, w, h, App.options.renderer);
  var textures = {
    file: 'img/flt.png',
    agent: [26, 16, 51, 36],
    wall: [274, 14, 32, 32],
    path: [326, 14, 32, 32]
  };
  App._engine = new CrowdSim.Engine(App._world, App.options.engine);
  /* use default {
      timeStepSize: 0.1, // time per step
      timeStepRun: 0.001 // time between step runnings
    });/*/
  var events = {
    onPreRender: App.callbacks.onPreRender, // before each render cycle
    onPostRender: App.callbacks.onPostRender,
    mouseover: App.entity.mouseover,
    mouseout: App.entity.mouseout,
    mousedown: App.entity.mousedown,
    mouseup: App.entity.mouseup,
    mousemove: App.entity.mousemove
  };
  App._renderer.init(textures, events);
  var optionsWorld = {
    width: w,
    height: h,
    onCreateAgents: App.onCreateAgents,
    onDestroyAgents: App.onDestroyAgents,
    onCreateEntity: App.onCreateEntity,
    onDestroyEntity: App.onDestroyEntity
  };
  var world = App._world = new CrowdSim.World(this, optionsWorld);
};

/**
 * Description
 * @method resize
 * @param {} window
 * @param {} width
 * @param {} height
 * @return
 */
App.resize = function(window, width, height) {
  // to wait for fullscreen state
  setTimeout(function() {
    var w = width || window.innerWidth;
    var h = height || window.innerHeight;
    App._renderer.resize(w, h);
  }, 200);
};

/**
 * Description
 * @method zoom
 * @param {} scale
 * @param {} x
 * @param {} y
 * @return
 */
App.zoom = function(scale, x, y) {
  App._renderer.zoom(scale, x, y);
};

/**
 * Description
 * @method pan
 * @param {} dx
 * @param {} dy
 * @return
 */
App.pan = function(dx, dy) {
  App._renderer.pan(dx, dy);
};

/**
 * Description
 * @method screenToWorld
 * @param {} x
 * @param {} y
 * @return CallExpression
 */
App.screenToWorld = function(x, y) {
  return App._renderer.screenToWorld(x, y);
};
/**
 * Description
 * @method worldToScreen
 * @param {} x
 * @param {} y
 * @return CallExpression
 */
App.worldToScreen = function(x, y) {
  return App._renderer.worldToScreen(x, y);
};

/**
 * Description
 * @method toggleRun
 * @return
 */
App.toggleRun = function() {
  if (App.isRunning()) {
    return App.stop();
  } else {
    return App.run();
  }
};

/**
 * Description
 * @method isRunning
 * @return MemberExpression
 */
App.isRunning = function() {
  return App._engine.running;
};

/**
 * Description
 * @method run
 * @return CallExpression
 */
App.run = function() {
  return App._engine.run();
};

/**
 * Description
 * @method stop
 * @return CallExpression
 */
App.stop = function() {
  return App._engine.stop();
};

/**
 * Description
 * @method step
 * @return CallExpression
 */
App.step = function() {
  return App._engine.step();
};

/**
 * Description
 * @method reset
 * @return CallExpression
 */
App.reset = function() {
  return App._engine.reset();
};

/**
 * Description
 * @method getStats
 * @return ObjectExpression
 */
App.getStats = function() {
  var entities = App._world.entities;
  return {
    running: App._engine.running,
    iterations: App._engine.iterations,
    groups: App._world.getGroups().length,
    agents: App._world.getAgents().length,
    contexts: entities.contexts.length,
    walls: entities.walls.length,
    paths: entities.paths.length,
    agent: App._world.agentSelected ? App._world.agentSelected.id : ''
  };
};

/**
 * Description
 * @method cycleDetail
 * @param {} entityType
 * @return
 */
App.cycleDetail = function(entityType) {
  entityType.detail.cycleDetail();
};

/**
 * Description
 * @method getEngineSettings
 * @return CallExpression
 */
App.getEngineSettings = function() {
  return App._engine.getSettings();
};

/**
 * Description
 * @method save
 * @param {} save
 * @return raw
 */
App.save = function(save) {
  var raw = App._world.save(save);
  App.callbacks.onSave(App._world);
  return raw;
};

/**
 * Description
 * @method loadExample
 * @param {} name
 * @return
 */
App.loadExample = function(name) {
  App._renderer.stop();
  App.load(Worlds[name],false);
  App._renderer.start();
};

/**
 * Description
 * @method listExamples
 * @return CallExpression
 */
App.listExamples = function() {
  return Lazy(Worlds).keys().toArray();
};

/**
 * Description
 * @method clear
 * @return
 */
App.clear = function() {
  CrowdSim.restartIds();
  // remove current entities
  var entities = App._world.getEntitiesIterator().toArray();
  Lazy(entities).each(function(entity) {
    entity.view.destroy();
  });
};

/**
 * Description
 * @method load
 * @param {} loader
 * @param {} loadDefault
 * @return
 */
App.load = function(loader, loadDefault) {
  this.clear();
  App.selectEntity(null);
  App.createEntityEnd();
  App._world.load(loader,loadDefault);
  App._engine.setWorld(App._world);
  App._renderer.setWorld(App._world);
  // loads all entities creating render objects
  Lazy(App._world.getEntitiesIterator()).each(function(entity) {
    App.addEntity(entity);
  });

  App.callbacks.onLoad(App._world);
};

/**
 * Description
 * @method onCreateAgents
 * @param {} agents
 * @return
 */
App.onCreateAgents = function(agents) {
  Lazy(agents).each(function(a) {
    new Render.Agent(a);
  });
};

/**
 * Description
 * @method onDestroyAgents
 * @param {} agents
 * @return
 */
App.onDestroyAgents = function(agents) {
  Lazy(agents).each(function(a) {
    a.view.destroy();
  });
};

/**
 * Description
 * @method onCreateEntity
 * @param {} entity
 * @return
 */
App.onCreateEntity = function(entity) {
  if (App.callbacks.onCreateEntity) {
    App.callbacks.onCreateEntity(entity);
  }
};

/**
 * Description
 * @method onDestroyEntity
 * @param {} entity
 * @return
 */
App.onDestroyEntity = function(entity) {
  if (entity.view) {
    entity.view.destroy();
  }
  if (App.callbacks.onDestroyEntity) {
    App.callbacks.onDestroyEntity(entity);
  }
};

/**
 * Description
 * @method createEntityStart
 * @param {} entityType
 * @param {} pos
 * @return MemberExpression
 */
App.createEntityStart = function(entityType, pos) {
  var entity = entityType.CreateFromPoint(pos.x, pos.y, App._world);
  App._newRenderEntity = entity;
  return App._newRenderEntity;
};

// returns current entity creation of null if finished
/**
 * Description
 * @method getCreatingEntity
 * @return MemberExpression
 */
App.getCreatingEntity = function() {
  return App._newRenderEntity;
};

/**
 * Description
 * @method createEntityEnd
 * @return Literal
 */
App.createEntityEnd = function() {
  App._renderer.drawHelperLine(null);
  App._newRenderEntity = null;
  return null;
};

/**
 * Description
 * @method destroyEntity
 * @param {} entity
 * @return
 */
App.destroyEntity = function(entity) {
  entity.destroy();
  if (App._entitySelected === entity) {
    App.selectEntity(null);
  }
};

/**
 * Description
 * @method editEntity
 * @param {} entity
 * @return
 */
App.editEntity = function(entity) {
  if (!App._newRenderEntity) { // stops from editing one entity if not finished with Previous
    App._editingEntity = App._entitySelected;
    if (App._editingEntity instanceof Render.Group) {
      var group = App._editingEntity.getGroup();
      // clear current associations
      group.assignPath(null);
      group.assignStartContext(null);
      group.assignEndContext(null);
    }
  }
};

/**
 * Description
 * @method addEntity
 * @param {} entity
 * @return
 */
App.addEntity = function(entity) {
  var renderEntityProto = App.EntityCreationMapping[entity.constructor.type];
  var renderEntity = renderEntityProto.CreateFromModel(entity, App._world);
};

/**
 * Description
 * @method selectEntity
 * @param {} entity
 * @return
 */
App.selectEntity = function(entity) {
  if (App._entitySelected) {
    // hack to hide in stage
    App._entitySelected.hover = false;
    if (App.callbacks.onEntityUnSelected) {
      App.callbacks.onEntityUnSelected(App._entitySelected);
    }
  }
  App._entitySelected = entity;
  if (entity) {
    // hack to show in stage
    entity.hover = true;
    if (App.callbacks.onEntitySelected) {
      App.callbacks.onEntitySelected(App._entitySelected);
    }
  }
};

/**
 * Description
 * @method getSelectedEntity
 * @return MemberExpression
 */
App.getSelectedEntity = function() {
  return App._entitySelected;
};

/**
 * Description
 * @method selectEntityById
 * @param {} id
 * @return
 */
App.selectEntityById = function(id) {
  var entity = App._world.getEntityById(id);
  if (entity) {
    App.selectEntity(entity.view);
  }
};

/* Stagen a render entities mouse events */
App.entity = {};

/**
 * Description
 * @method mousedown
 * @param {} event
 * @return Literal
 */
App.entity.mousedown = function(event) {
  if (App.options.logEvents) {
    console.log(event);
  }
  // this points to the render entity
  App._globalMousePressed = true;
  this.entity.drag = true;
  var point = event.data.getLocalPosition(this.parent);
  if (this.entity.mousedown) {
    this.entity.mousedown(point);
  }
  var anchor = this.entity.getAnchor();
  this.mousedownAnchor = {x: anchor.x - point.x, y: anchor.y - point.y};
  event.stopPropagation();
  App.selectEntity(this.entity);
  App._entityHit = this.entity; // to deselect
  return false;
};

/**
 * Description
 * @method entityClick
 * @param {} pos
 * @param {} newEntity
 * @param {} selected
 * @return
 */
App.entityClick = function(pos, newEntity, selected) {
  if (newEntity instanceof Render.Joint) { // add joint to joint
    var existingJoint = newEntity.getJoint();
    App._newRenderEntity = existingJoint.parent.view.addJoint(pos.x, pos.y, {previousJoint: existingJoint});
  } else if (newEntity instanceof Render.Wall) { // add joint to wall
    newEntity.addJoint(pos.x, pos.y);
  } else if (newEntity instanceof Render.Path) { // add join to waypoint
    newEntity.addJoint(pos.x, pos.y); // use default radius
  } else if (newEntity instanceof Render.Context) { // add context
    newEntity.setArea(pos.x, pos.y);
  } else if (newEntity instanceof Render.Group) { // add group
    var group = newEntity.getGroup();
    // for groups creation proccess is more complex a path, startcontext and endcontext could be assigned
    if (selected instanceof Render.Joint) {
      var joint = selected.getJoint();
      var newPath = joint.parent;
      var currentPath = group.getPath();
      if (!currentPath) {
        var idxInPath = newPath.getJointIdx(joint);
        group.assignPath(newPath, idxInPath);
      }
    } else if (selected instanceof Render.Context) {
      var context = selected.getContext();
      var startContext = group.getStartContext();
      var endContext = group.getEndContext();
      if (!startContext) {
        group.assignStartContext(context);
      } else if (!endContext) {
        group.assignEndContext(context);
      }
    } else {

    }
    // check if group is completed to end creation mode
    if (group.getPath() && group.getStartContext() && group.getEndContext()) {
      App.createEntityEnd();
    }
  }
};

// stage mousedown creation of entities steps
/**
 * Description
 * @method mousedown
 * @param {} event
 * @return
 */
App.mousedown = function(event) {
  if (App.options.logEvents) {
    console.log(event);
  }
  App._globalMousePressed = true;
  switch (event.button) {
    case 0: // left button
      if (App._editingEntity) { // change editing to create
        App._newRenderEntity = App._editingEntity;
        App._editingEntity = null;
      } else if (App._newRenderEntity) { // creating/entities entities
        var pos = App._renderer.screenToWorld(event.clientX, event.clientY);
        App.entityClick(pos, App._newRenderEntity, App._entitySelected);
        App._entityHit = true;
      }
  }
  if (!App._entityHit) {
    App.selectEntity(null);
  }
  App._entityHit = false;
};

/**
 * Description
 * @method mousemove
 * @param {} event
 * @return
 */
App.entity.mousemove = function(event) {
  // this points to the render entity
  if (this.entity) {
    if (!App._globalMousePressed) { // correct mouse up out of the entity
      this.entity.drag = false;
    }
    if (this.entity.drag) {
      var newPosition = event.data.getLocalPosition(this.parent);
      if (App.snapToGrid) {
        newPosition.x = Math.round(newPosition.x);
        newPosition.y = Math.round(newPosition.y);
      }
      this.entity.dragTo(newPosition, this.mousedownAnchor);
    }
  }
};

// stage mousemove
/**
 * Description
 * @method mousemove
 * @param {} event
 * @return
 */
App.mousemove = function(event) {
  // this points to the graphics/sprite
  if (App._newRenderEntity) {
    var origin = App._newRenderEntity.getPos();
    //var pos = event.data.getLocalPosition(this.parent);
    var pos = App._renderer.screenToWorld(event.clientX, event.clientY);
    App._renderer.drawHelperLine(origin[0], origin[1], pos.x, pos.y);
  }
};

/**
 * Description
 * @method mousewheel
 * @param {} event
 * @return
 */
App.mousewheel = function(event) {
  var entity = App._entitySelected;
  if (entity && App._globalMousePressed) {
    if (entity instanceof Render.Joint) {
      var joint  = entity.getJoint();
      joint.incrRadius(event.deltaY);
      return true;
    } else if (entity instanceof Render.Group) {
      var group  = entity.getGroup();
      group.incrRadius(event.deltaY);
      return true;
    } else if (entity instanceof Render.Context) {
      var context  = entity.getContext();
      context.incrSize(event.deltaY);
      return true;
    }
  }
};

/**
 * Description
 * @method mouseup
 * @param {} event
 * @return Literal
 */
App.entity.mouseup = function(event) {
  if (App.options.logEvents) {
    console.log(event);
  }
  // this points to the graphics/sprite
  // to use in entities to end dragging action
  App._globalMousePressed = false;
  this.entity.drag = false;
  if (this.entity.mouseup) {
    this.entity.mouseup();
  }
  this.entity.mousedownAnchor = null;
  event.stopPropagation();
  return false;
};

/**
 * Description
 * @method mouseup
 * @param {} event
 * @return
 */
App.mouseup = function(event) {
  if (App.options.logEvents) {
    console.log(event);
  }
  // entities don't receive mouseup event when mouse is out
  App._globalMousePressed = false;
};

/**
 * Description
 * @method mouseout
 * @param {} event
 * @return
 */
App.entity.mouseout = function(event) {
  if (App.options.logEvents) {
    console.log(event);
  }
  // this points to the graphics/sprite
  if (App._entitySelected !== this.entity) {
    this.entity.hover = false;
    this.entity.tint = 0x999999;
  }
};

/**
 * Description
 * @method mouseover
 * @param {} event
 * @return
 */
App.entity.mouseover = function(event) {
  if (App.options.logEvents) {
    console.log(event);
  }
  // this points to the graphics/sprite
  this.entity.hover = true;
  this.entity.tint = 0xFFFFFF;
};

module.exports = App;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSimApp = App;
}

},{"./Render/Render":11,"./Worlds":13,"CrowdSim":"CrowdSim"}],2:[function(require,module,exports){
'use strict';

var Vec2 = require('CrowdSim').Vec2;
var Base = require('./Base');
var Detail = require('./Detail');
var Colors = Base.Colors;

/**
 * Description
 * @method Agent
 * @param {} agent
 * @return 
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
 * Description
 * @method destroy
 * @return 
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
 * Description
 * @method render
 * @return 
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

},{"./Base":3,"./Detail":5,"CrowdSim":"CrowdSim"}],3:[function(require,module,exports){
'use strict';

var Colors = {
  Hover: 0xebff00,
  Context: 0x646729,
  Agent: 0xFF0000,
  Group: 0xAAAAAA,
  Wall: 0x00FF00,
  Joint: 0xAAAAAA,
  Path: 0xe00777,
  Waypoint: 0x7a7a7a,
  Forces: {desired: 0xfffff,
          agents: 0xFF0000,
          walls: 0xc49220
        },
  Helpers: 0xFFFFFF
};

var Fonts = {
  default: {font: '2px Mono monospace', fill: 0xFFFFFF,
  align: 'center'},
  resolution: 12
};

module.exports.Colors = Colors;
module.exports.Fonts = Fonts;

},{}],4:[function(require,module,exports){
'use strict';

var ContextModel = require('CrowdSim').Context;
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

/**
 * Description
 * @method Context
 * @param {} context
 * @return
 */
var Context = function(context) {
  if (!context) {
    throw 'Context object must be defined';
  }
  Entity.call(this, context);
};

/**
 * Description
 * @method CreateFromModel
 * @param {} context
 * @return NewExpression
 */
Context.CreateFromModel = function(context) {
  return new Context(context);
};

/**
 * Description
 * @method CreateFromPoint
 * @param {} x
 * @param {} y
 * @param {} parent
 * @param {} options
 * @return NewExpression
 */
Context.CreateFromPoint = function(x, y, parent, options) {
  var context = new ContextModel(x, y, parent, options);
  return new Context(context);
};

/**
 * Description
 * @method destroy
 * @return
 */
Context.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Context.container, this.graphics);
  Entity.prototype.destroy.call(this);
};

/**
 * Description
 * @method createGraphics
 * @param {} context
 * @return
 */
Context.prototype.createGraphics = function(context) {
  this.graphics = Entity.prototype.createGraphics.call(this,Context.container);
  this.label = new PIXI.Text(context.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  this.rect = new PIXI.Rectangle(0, 0, 0, 0);
  this.rect.entityModel = context;
  this.graphics.entity = this;
};

/**
 * Description
 * @method getAnchor
 * @param {} init
 * @return ObjectExpression
 */
Context.prototype.getAnchor = function(init) {
  var context = this.entityModel;
  return {x: context.pos[0], y: context.pos[1]};
};

/**
 * Description
 * @method dragTo
 * @param {} pos
 * @param {} anchor
 * @return
 */
Context.prototype.dragTo = function(pos, anchor) {
  var context = this.entityModel;
  context.pos[0] = pos.x;
  context.pos[1] = pos.y;
};

/**
 * Description
 * @method render
 * @param {} options
 * @return
 */
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

/**
 * Description
 * @method setArea
 * @param {} x
 * @param {} y
 * @return
 */
Context.prototype.setArea = function(x, y) {
  this.entityModel.setArea(x, y);
};

/**
 * Description
 * @method getContext
 * @return MemberExpression
 */
Context.prototype.getContext = function() {
  return this.entityModel;
};

/**
 * Description
 * @method getPos
 * @return CallExpression
 */
Context.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

Context.detail = new Detail(2);

module.exports = Context;

},{"./Base":3,"./Detail":5,"./Entity":6,"CrowdSim":"CrowdSim"}],5:[function(require,module,exports){
'use strict';

/**
 * Description
 * @method Detail
 * @param {} maxDetail
 * @param {} detail
 * @return 
 */
var Detail = function(maxDetail, detail) {
  this.maxDetail = maxDetail;
  this.level = detail || 1;
};

/**
 * Description
 * @method cycleDetail
 * @param {} detail
 * @return 
 */
Detail.prototype.cycleDetail = function(detail) {
  if (detail) {
    this.level = detail;
  } else {
    this.level ++;
    if (this.level > this.maxDetail) {
      this.level = 0;
    }
  }
};

module.exports = Detail;

},{}],6:[function(require,module,exports){
'use strict';

var Base = require('./Base');

/**
 * Base render prototype
 * @method Entity
 * @param {} entity
 * @return 
 */
var Entity = function(entity) {
  if (!entity) {
    throw 'Entity undefined';
  }
  this.entityModel = entity;
  this.entityModel.view = this;
  this.selected = false;
};

/**
 * Description
 * @method destroy
 * @return 
 */
Entity.prototype.destroy = function() {
  if (this.entityModel) {
    this.entityModel.view = null;
    this.entityModel.destroy();
    this.entityModel = null;
  }
};

/**
 * Description
 * @method createGraphics
 * @param {} container
 * @param {} graphics
 * @return graphics
 */
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

/**
 * Description
 * @method destroyGraphics
 * @param {} container
 * @param {} graphics
 * @return 
 */
Entity.prototype.destroyGraphics = function(container, graphics) {
  if (graphics) {
    container.removeChild(graphics);
    graphics.interactive = false;
    graphics.buttonMode = false;
    graphics.destroy();
  }
};

/**
 * Description
 * @method setInteractive
 * @param {} displayObject
 * @return 
 */
Entity.setInteractive = function(displayObject) {
  displayObject.interactive = true;
  displayObject.buttonMode = true;
  displayObject.mouseover = Entity.mouseover;
  displayObject.mouseout = Entity.mouseout;
  displayObject.mousedown = Entity.mousedown;
  displayObject.mouseup = Entity.mouseup;
  displayObject.mousemove = Entity.mousemove;
};

/**
 * Description
 * @method render
 * @param {} graphics
 * @return 
 */
Entity.prototype.render = function(graphics) {
  //this.display.clear();
};

/**
 * Description
 * @method getPos
 * @return MemberExpression
 */
Entity.prototype.getPos = function() {
  return this.entityModel.pos;
};

Entity.mousedown = null;
Entity.mousemove = null;
Entity.mouseup = null;
Entity.mouseover = null;
Entity.mouseout = null;

module.exports = Entity;

},{"./Base":3}],7:[function(require,module,exports){
'use strict';

var GroupModel = require('CrowdSim').Group;
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

/**
 * Description
 * @method Group
 * @param {} group
 * @return 
 */
var Group = function(group) {
  if (!group) {
    throw 'Group object must be defined';
  }
  Entity.call(this, group);
};

/**
 * Description
 * @method CreateFromModel
 * @param {} group
 * @return NewExpression
 */
Group.CreateFromModel = function(group) {
  return new Group(group);
};

/**
 * Description
 * @method CreateFromPoint
 * @param {} x
 * @param {} y
 * @param {} parent
 * @param {} options
 * @return NewExpression
 */
Group.CreateFromPoint = function(x, y, parent, options) {
  var group = new GroupModel(x, y, parent, options);
  return new Group(group);
};

/**
 * Description
 * @method destroy
 * @return 
 */
Group.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Group.container, this.graphics);
  Entity.prototype.destroy.call(this);
};

/**
 * Description
 * @method createGraphics
 * @param {} group
 * @return 
 */
Group.prototype.createGraphics = function(group) {
  this.graphics = Entity.prototype.createGraphics.call(this,Group.container);
  this.label = new PIXI.Text(group.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  this.circle = new PIXI.Circle(group.pos[0], group.pos[1], group.getRadius());
  this.circle.entityModel = group;
  this.graphics.entity = this;
};

/**
 * Description
 * @method render
 * @param {} options
 * @return 
 */
Group.prototype.render = function(options) {
  if (!Group.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var group = this.entityModel;
  // init render
  if (!this.graphics && Group.detail.level) {
    this.createGraphics(group);
  } else {
    this.graphics.clear();
  }

  if (Group.detail.level > 0) {
    this.label.x = group.pos[0] - this.label.width / 3;
    this.label.y = group.pos[1] - this.label.height / 2;
    this.circle.x = group.pos[0];
    this.circle.y = group.pos[1];
    this.circle.radius = group.getRadius();
    var color  = this.hover ? Colors.Hover : (group.options.agentsAspect || Colors.Group);
    this.graphics.beginFill(color, this.hover ? 0.9 : 0.3);
    this.graphics.drawShape(this.circle);
    this.graphics.endFill();
  }
  if (Group.detail.level > 1) {
    // draw helper lines to entities
    var entities = group.entities;
    this.graphics.lineStyle(0.2, Colors.Group, 0.3);
    if (entities.path) {
      this.graphics.moveTo(group.pos[0],group.pos[1]);
      var start = entities.path.getJointByIdx(group.getPathStartIdx());
      if (start) {
        this.graphics.lineTo(start.pos[0],start.pos[1]);
      }
    }
    if (entities.startContext) {
      this.graphics.moveTo(group.pos[0],group.pos[1]);
      this.graphics.lineTo(entities.startContext.pos[0],entities.startContext.pos[1]);
    }
    if (entities.endContext) {
      this.graphics.moveTo(group.pos[0],group.pos[1]);
      this.graphics.lineTo(entities.endContext.pos[0],entities.endContext.pos[1]);
    }
  }
};

/**
 * Description
 * @method getAnchor
 * @param {} init
 * @return ObjectExpression
 */
Group.prototype.getAnchor = function(init) {
  var group = this.entityModel;
  return {x: group.pos[0], y: group.pos[1]};
};

/**
 * Description
 * @method dragTo
 * @param {} pos
 * @param {} anchor
 * @return 
 */
Group.prototype.dragTo = function(pos, anchor) {
  var group = this.entityModel;
  group.pos[0] = pos.x;
  group.pos[1] = pos.y;
};

/**
 * Description
 * @method getPos
 * @return CallExpression
 */
Group.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

/**
 * Description
 * @method getGroup
 * @return MemberExpression
 */
Group.prototype.getGroup = function() {
  return this.entityModel;
};

Group.detail = new Detail(2,2);

module.exports = Group;

},{"./Base":3,"./Detail":5,"./Entity":6,"CrowdSim":"CrowdSim"}],8:[function(require,module,exports){
'use strict';

var Vec2 = require('CrowdSim').Vec2;
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

/**
 * Description
 * @method Joint
 * @param {} joint
 * @param {} texture
 * @return 
 */
var Joint = function(joint, texture) {
  if (!joint) {
    throw 'Joint object must be defined';
  }
  Entity.call(this, joint);
  this.texture = texture;
};

/**
 * Description
 * @method destroy
 * @param {} graphics
 * @return 
 */
Joint.prototype.destroy = function(graphics) {
  var line = this.entityModel.parent;
  this.graphics.removeChild(this.label);
  //this.label.destroy();
  Entity.prototype.destroyGraphics.call(this, this.graphics , this.sprite);
  Entity.prototype.destroy.call(this);
};

/**
 * Description
 * @method createGraphics
 * @param {} graphics
 * @return 
 */
Joint.prototype.createGraphics = function(graphics) {
  this.graphics = graphics;
  var joint = this.entityModel;
  //this.label = new PIXI.Text(joint.id, Base.Fonts.default);
  //this.label.resolution = Base.Fonts.resolution;
  //graphics.addChild(this.label);
  this.sprite = new PIXI.Sprite(this.texture);
  Entity.prototype.createGraphics.call(this, graphics, this.sprite);
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.sprite.entity = this;
  this.sprite.alpha = 0.5;
  this.render();
};

/**
 * Description
 * @method render
 * @return 
 */
Joint.prototype.render = function() {
  this.sprite.visible = true;
  this.sprite.alpha = 0.5;
  this.sprite.x = this.entityModel.pos[0];
  this.sprite.y = this.entityModel.pos[1];
  this.sprite.width = 2 * this.entityModel.getRadius();
  this.sprite.height = 2 * this.entityModel.getRadius();
  this.sprite.tint = this.hover ? Colors.Hover : Colors.Joint;
  //this.label.x = this.sprite.x - this.label.width / 3;
  //this.label.y = this.sprite.y - this.label.height / 2;
};

/**
 * Description
 * @method getAnchor
 * @param {} init
 * @return ObjectExpression
 */
Joint.prototype.getAnchor = function(init) {
  return {x: this.entityModel.pos[0], y: this.entityModel.pos[1]};
};

/**
 * Description
 * @method dragTo
 * @param {} pos
 * @param {} anchor
 * @return 
 */
Joint.prototype.dragTo = function(pos, anchor) {
  var anchorV2 = Vec2.fromValues(anchor.x,anchor.y);
  var radius = Vec2.length(anchorV2);
  var posV2 = Vec2.fromValues(pos.x,pos.y);
  Vec2.subtract(posV2,posV2,this.entityModel.pos);
  var newRadius = Vec2.length(posV2);
  // drag to new position
  this.entityModel.pos[0] = pos.x;
  this.entityModel.pos[1] = pos.y;
  this.sprite.x = pos.x;
  this.sprite.y = pos.y;
};

/**
 * Description
 * @method getJoint
 * @return MemberExpression
 */
Joint.prototype.getJoint = function() {
  return this.entityModel;
};

/**
 * Description
 * @method getPos
 * @return CallExpression
 */
Joint.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

/**
 * Description
 * @method show
 * @param {} show
 * @return 
 */
Joint.prototype.show = function(show) {
  this.sprite.visible = false;
  this.sprite.alpha = 0;
};

module.exports = Joint;

},{"./Base":3,"./Detail":5,"./Entity":6,"CrowdSim":"CrowdSim"}],9:[function(require,module,exports){
'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

/**
 * Description
 * @method LinePrototype
 * @param {} color
 * @return Line
 */
var LinePrototype = function(color) {

  /**
   * Description
   * @method Line
   * @param {} line
   * @return 
   */
  var Line = function(line) {
    if (!line) {
      throw 'Line object must be defined';
    }
    Entity.call(this, line);
  };

  /**
   * Description
   * @method destroy
   * @return 
   */
  Line.prototype.destroy = function() {
    var that = this;
    that.graphics.removeChild(that.label);
    that.label.destroy();
    Entity.prototype.destroyGraphics.call(that, Line.container, that.graphics);
    Entity.prototype.destroy.call(that);
  };

  /**
   * Description
   * @method createGraphics
   * @param {} line
   * @return 
   */
  Line.prototype.createGraphics = function(line) {
    this.graphics = Entity.prototype.createGraphics.call(this, Line.container);
    this.label = new PIXI.Text(line.id, Base.Fonts.default);
    this.label.resolution = Base.Fonts.resolution;
    this.graphics.addChild(this.label);
    var jts = line.getJoints();
    this.label.x = jts[0].pos[0] - this.label.width / 2;
    this.label.y = jts[0].pos[1] - this.label.height / 2;
    if (jts && jts.length > 0) {
      for (var i in jts) {
        this.addJointFromModel(jts[i]);
      }
    }
  };

  /**
   * Description
   * @method addJointFromModel
   * @param {} joint
   * @return renderJoint
   */
  Line.prototype.addJointFromModel = function(joint) {
    var renderJoint = new Joint(joint, Line.texture);
    renderJoint.createGraphics(this.graphics);
    return renderJoint;
  };

  /**
   * Description
   * @method addJoint
   * @param {} x
   * @param {} y
   * @param {} options
   * @return CallExpression
   */
  Line.prototype.addJoint = function(x, y, options) {
    var line = this.entityModel;
    var jt = line.addJoint(x, y, options);
    return this.addJointFromModel(jt);
  };

  /**
   * Description
   * @method render
   * @param {} options
   * @return 
   */
  Line.prototype.render = function(options) {
    if (!Line.detail.level) {
      this.graphics.clear();
      return;
    }
    Entity.prototype.render.call(this, this.graphics);
    var line = this.entityModel;
    var jts = line.getJoints();
    if (!line || jts.length === 0) {
      this.destroy();
      for (var i = 0; i < jts.length; i++) {
        jts[i].view.show(false);
      }
    }
    // init render
    if (!this.graphics && Line.detail.level > 0) {
      this.createGraphics(line);
    } else {
      this.graphics.clear();
    }

    if (Line.detail.level > 0) {
      var points  = [];
      this.label.x = jts[0].pos[0] - this.label.width / 3;
      this.label.y = jts[0].pos[1] - this.label.height ;
      this.graphics.lineStyle(line.getWidth(), this.hover ? Colors.Hover : color, 0.6);
      for (var j = 0; j < jts.length; j++) {
        points.push(jts[j].pos[0], jts[j].pos[1]);
        jts[j].view.render();
      }
      this.graphics.drawPolygon(points);
    }
    if (Line.detail.level > 1) {
    }
  };
  return Line;
};

module.exports = LinePrototype;

},{"./Base":3,"./Detail":5,"./Entity":6,"./Joint":8}],10:[function(require,module,exports){
'use strict';

var PathModel = require('CrowdSim').Path;
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var LinePrototype = require('./LinePrototype');
var Colors = Base.Colors;

var Path = LinePrototype(Colors.Path);

/**
 * Description
 * @method CreateFromModel
 * @param {} path
 * @return NewExpression
 */
Path.CreateFromModel = function(path) {
  return new Path(path);
};

/**
 * Description
 * @method CreateFromPoint
 * @param {} x
 * @param {} y
 * @param {} parent
 * @param {} options
 * @return NewExpression
 */
Path.CreateFromPoint = function(x, y, parent, options) {
  var path = new PathModel(x, y, parent, options);
  return new Path(path);
};

/**
 * Description
 * @method getPos
 * @return CallExpression
 */
Path.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

Path.texture = null; // paths joint texture
Path.detail = new Detail(2);

module.exports = Path;

},{"./Base":3,"./Detail":5,"./Entity":6,"./LinePrototype":9,"CrowdSim":"CrowdSim"}],11:[function(require,module,exports){
'use strict';

var Base = require('./Base');
var Colors = Base.Colors;

/**
 * Description
 * @method Render
 * @param {} canvas
 * @param {} w
 * @param {} h
 * @param {} options
 * @return 
 */
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

/**
 * Description
 * @method init
 * @param {} textures
 * @param {} events
 * @return 
 */
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

/**
 * Description
 * @method start
 * @return 
 */
Render.prototype.start = function() {
  this._stop = false;
  this.animate();
};

/**
 * Description
 * @method animate
 * @return 
 */
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

/**
 * Description
 * @method stop
 * @return 
 */
Render.prototype.stop = function() {
  this._stop = true;
};

/**
 * Description
 * @method setWorld
 * @param {} world
 * @return 
 */
Render.prototype.setWorld = function(world) {
  this.world = world;
};

/**
 * Description
 * @method resize
 * @param {} w
 * @param {} h
 * @return 
 */
Render.prototype.resize = function(w, h) {
  this._renderer.resize(w,h);
};

/**
 * Description
 * @method drawHelperLine
 * @param {} x0
 * @param {} y0
 * @param {} x1
 * @param {} y1
 * @return 
 */
Render.prototype.drawHelperLine = function(x0, y0, x1, y1) {
  this._graphicsHelper.clear();
  if (x0) {
    this._graphicsHelper.clear();
    this._graphicsHelper.lineStyle(0.2, Colors.Helpers);
    this._graphicsHelper.moveTo(x0, y0);
    this._graphicsHelper.lineTo(x1, y1);
  }
};

/**
 * Description
 * @method zoom
 * @param {} scale
 * @param {} x
 * @param {} y
 * @return 
 */
Render.prototype.zoom = function(scale, x, y) {
  scale = scale > 0 ? 1.1 : 0.9;
  var currentWorldPos = this.screenToWorld(x, y);
  this._stage.scale.x = this._stage.scale.x * scale;
  this._stage.scale.y = this._stage.scale.y * scale;
  var newScreenPos = this.worldToScreen(currentWorldPos.x, currentWorldPos.y);
  this._stage.x -= (newScreenPos.x - x) ;
  this._stage.y -= (newScreenPos.y - y) ;
};

/**
 * Description
 * @method pan
 * @param {} dx
 * @param {} dy
 * @return 
 */
Render.prototype.pan = function(dx, dy) {
  this._stage.x += dx;
  this._stage.y += dy;
};

/**
 * Description
 * @method getWidth
 * @return MemberExpression
 */
Render.prototype.getWidth = function() {
  return this._stage.width;
};

/**
 * Description
 * @method getHeight
 * @return MemberExpression
 */
Render.prototype.getHeight = function() {
  return this._stage.height;
};

/**
 * Description
 * @method screenToWorld
 * @param {} x
 * @param {} y
 * @return ObjectExpression
 */
Render.prototype.screenToWorld = function(x, y) {
  return {x: (x - this._stage.x) / this._stage.scale.x,
          y: (y - this._stage.y) / this._stage.scale.y};
};
/**
 * Description
 * @method worldToScreen
 * @param {} x
 * @param {} y
 * @return ObjectExpression
 */
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

},{"./Agent":2,"./Base":3,"./Context":4,"./Entity":6,"./Group":7,"./Joint":8,"./Path":10,"./Wall":12}],12:[function(require,module,exports){
'use strict';

var WallModel = require('CrowdSim').Wall;
var Base = require('./Base');
var Entity = require('./Entity');
var LinePrototype = require('./LinePrototype');
var Detail = require('./Detail');
var Colors = Base.Colors;
var Fonts = Base.Fonts;

var Wall = LinePrototype(Colors.Wall);

/**
 * Description
 * @method CreateFromModel
 * @param {} wall
 * @return NewExpression
 */
Wall.CreateFromModel = function(wall) {
  return new Wall(wall);
};

/**
 * Description
 * @method CreateFromPoint
 * @param {} x
 * @param {} y
 * @param {} parent
 * @param {} options
 * @return NewExpression
 */
Wall.CreateFromPoint = function(x, y, parent, options) {
  var wall = new WallModel(x, y, parent, options);
  return new Wall(wall);
};

/**
 * Description
 * @method getPos
 * @return CallExpression
 */
Wall.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

Wall.texture = null; // wall joints texture
Wall.detail = new Detail(2);

module.exports = Wall;

},{"./Base":3,"./Detail":5,"./Entity":6,"./LinePrototype":9,"CrowdSim":"CrowdSim"}],13:[function(require,module,exports){
'use strict';
var CrowdSim = require('CrowdSim');

var Worlds = {
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  groupSimple: {
    "contexts": [],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 100,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 4,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 78.9000015258789,
        "1": 41.70000076293945
      },
      "entities": {
        "path": null,
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  groupSizes: {
    "contexts": [],
    "groups": [{
      "options": {
        "agentsMaxVel": 2,
        "agentsMaxAccel": 0.5,
        "agentsAspect": 0,
        "agentsSizeMin": 0.3,
        "agentsSizeMax": 0.9,
        "agentsCount": 200,
        "agentsMax": 200,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0,
        "near": 10
      },
      "id": "G1",
      "pos": {
        "0": 51,
        "1": 43
      },
      "entities": {
        "path": null,
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  groupSizeVel: {
    "contexts": [],
    "groups": [{
      "options": {
        "agentsMaxVel": 2,
        "agentsMaxAccel": 0.5,
        "agentsAspect": 0,
        "agentsSizeMin": 0.4,
        "agentsSizeMax": 0.5,
        "agentsCount": 100,
        "agentsMax": 300,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 8,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0,
        "near": 10
      },
      "id": "G0",
      "pos": {
        "0": 28.899999618530273,
        "1": 39.900001525878906
      },
      "entities": {
        "path": "P0",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsMaxVel": 0.9,
        "agentsMaxAccel": 0.5,
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.8,
        "agentsCount": 100,
        "agentsMax": 300,
        "debug": false,
        "pathStart": 2,
        "pathReverse": true,
        "pathCircular": false,
        "radius": 8,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0,
        "near": 10
      },
      "id": "G1",
      "pos": {
        "0": 115.5,
        "1": 40.29999923706055
      },
      "entities": {
        "path": "P0",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P0",
      "pos": {
        "0": 98.5,
        "1": 40.20000076293945
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 7,
            "scalable": true
          },
          "pos": {
            "0": 46.900001525878906,
            "1": 39.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 8,
            "scalable": true
          },
          "pos": {
            "0": 83.30000305175781,
            "1": 40.29999923706055
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 7,
            "scalable": true
          },
          "pos": {
            "0": 99.5999984741211,
            "1": 40.20000076293945
          },
          "entities": {},
          "children": {},
          "id": "J4"
        }]
      }
    }],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  contextIn: {
    "contexts": [{
      "options": {
        "width": 39,
        "height": 17.000001525878908
      },
      "id": "C0",
      "pos": {
        "0": 75.5999984741211,
        "1": 23.100000381469727
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.2,
        "startRate": 5,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 75.5999984741211,
        "1": 61.599998474121094
      },
      "entities": {
        "path": null,
        "startContext": "C0",
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  contextOut: {
    "contexts": [{
      "options": {
        "width": 11.999996948242199,
        "height": 44.599999999999994
      },
      "id": "C0",
      "pos": {
        "0": 82,
        "1": 48.29999923706055
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 100,
        "agentsMax": 1000,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 30,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0.2,
        "endRate": 5
      },
      "id": "G0",
      "pos": {
        "0": 41.099998474121094,
        "1": 48.400001525878906
      },
      "entities": {
        "path": null,
        "startContext": null,
        "endContext": "C0"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  contextInOut: {
    "contexts": [{
      "options": {
        "width": 18.60000305175781,
        "height": 61.39999847412109
      },
      "id": "C0",
      "pos": {
        "0": 44.29999923706055,
        "1": 45.70000076293945
      },
      "entities": {},
      "children": {}
    }, {
      "options": {
        "width": 15.199996948242188,
        "height": 72.4000015258789
      },
      "id": "C4",
      "pos": {
        "0": 108.69999694824219,
        "1": 49
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 200,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.5,
        "startRate": 10,
        "endProb": 0.5,
        "endRate": 5
      },
      "id": "G2",
      "pos": {
        "0": 81.30000305175781,
        "1": 83
      },
      "entities": {
        "path": null,
        "startContext": "C0",
        "endContext": "C4"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  contextMobility: {
    "contexts": [{
      "options": {
        "width": 39,
        "height": 17.000001525878908,
        "mobility": 1,
        "hazardLevel": 0
      },
      "id": "C0",
      "pos": {
        "0": 75.5999984741211,
        "1": 23.100000381469727
      },
      "entities": {},
      "children": {}
    }, {
      "options": {
        "mobility": 0.5,
        "hazardLevel": 0,
        "width": 10,
        "height": 10
      },
      "id": "C1",
      "pos": {
        "0": 76.5999984741211,
        "1": 44.20000076293945
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.2,
        "startRate": 5,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 75.5999984741211,
        "1": 61.599998474121094
      },
      "entities": {
        "path": null,
        "startContext": "C0",
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  contextTrigger: {
    "contexts": [{
      "options": {
        "width": 24,
        "height": 2.0000015258789077,
        "mobility": 1,
        "hazardLevel": 0,
        "triggerOnEmpty": true
      },
      "id": "C0",
      "pos": {
        "0": 75.1729736328125,
        "1": 46.50312423706055
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0,
        "startRate": 5,
        "endProb": 0,
        "endRate": 0,
        "near": 10
      },
      "id": "G0",
      "pos": {
        "0": 75.47578430175781,
        "1": 61.03791427612305
      },
      "entities": {
        "path": null,
        "startContext": "C0",
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  contextRate: {
    "contexts": [{
      "options": {
        "width": 9.799996948242182,
        "height": 10.599999999999994
      },
      "id": "C0",
      "pos": {
        "0": 41.400001525878906,
        "1": 31.700000762939453
      },
      "entities": {},
      "children": {}
    }, {
      "options": {
        "width": 16.9999969482422,
        "height": 19.00000076293945
      },
      "id": "C1",
      "pos": {
        "0": 95.4000015258789,
        "1": 31
      },
      "entities": {},
      "children": {}
    }, {
      "options": {
        "width": 16.200001525878903,
        "height": 14.800001525878912
      },
      "id": "C2",
      "pos": {
        "0": 42.5,
        "1": 59
      },
      "entities": {},
      "children": {}
    }, {
      "options": {
        "width": 13.600003051757824,
        "height": 13.799996948242182
      },
      "id": "C3",
      "pos": {
        "0": 94.30000305175781,
        "1": 57.900001525878906
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 200,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.5,
        "startRate": 1,
        "endProb": 0.1,
        "endRate": 2
      },
      "id": "G0",
      "pos": {
        "0": 62.79999923706055,
        "1": 17.5
      },
      "entities": {
        "path": null,
        "startContext": "C0",
        "endContext": "C1"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 2,
        "startProb": 0.1,
        "startRate": 1,
        "endProb": 0.15,
        "endRate": 1
      },
      "id": "G1",
      "pos": {
        "0": 68,
        "1": 72.9000015258789
      },
      "entities": {
        "path": null,
        "startContext": "C3",
        "endContext": "C2"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  pathCtxMobility: {
  "contexts": [
    {
      "options": {
        "mobility": 3,
        "triggerOnEmpty": false,
        "width": 44.72726912064988,
        "height": 19.8181811246005
      },
      "id": "C0",
      "pos": {
        "0": 82.34545135498047,
        "1": 26.045454025268555
      },
      "entities": {},
      "children": {}
    },
    {
      "options": {
        "mobility": 0.5,
        "triggerOnEmpty": false,
        "width": 42.36364246715199,
        "height": 16.545458013361156
      },
      "id": "C2",
      "pos": {
        "0": 81.61817932128906,
        "1": 55.40909194946289
      },
      "entities": {},
      "children": {}
    }
  ],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 13,
        "startProb": 0.2,
        "startRate": 5,
        "endProb": 0,
        "endRate": 0,
        "agentsMaxVel": 1,
        "agentsMaxAccel": 0.5,
        "near": 10
      },
      "id": "G0",
      "pos": {
        "0": 55.79999923706055,
        "1": 25.200000762939453
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 55.16363525390625,
        "1": 54.95454406738281
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 110.34545135498047,
              "1": 26.68181800842285
            },
            "entities": {},
            "children": {},
            "id": "J3"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 110.25454711914062,
              "1": 54.95454406738281
            },
            "entities": {},
            "children": {},
            "id": "J4"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 55.16363525390625,
              "1": 54.95454406738281
            },
            "entities": {},
            "children": {},
            "id": "J7"
          }
        ]
      }
    }
  ],
  "walls": []
},
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  pathLoop: {
    "contexts": [],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 6,
        "pathReverse": true,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 43.099998474121094,
        "1": 28.799999237060547
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G1",
      "pos": {
        "0": 103.30000305175781,
        "1": 28.200000762939453
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 62.5,
        "1": 43.70000076293945
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 91,
            "1": 43.5
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 115.30000305175781,
            "1": 48.400001525878906
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 107,
            "1": 74.9000015258789
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 68,
            "1": 77.9000015258789
          },
          "entities": {},
          "children": {},
          "id": "J3"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 41.900001525878906,
            "1": 72.4000015258789
          },
          "entities": {},
          "children": {},
          "id": "J4"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 44.5,
            "1": 45.400001525878906
          },
          "entities": {},
          "children": {},
          "id": "J5"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 62.5,
            "1": 43.70000076293945
          },
          "entities": {},
          "children": {},
          "id": "J6"
        }]
      }
    }],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  pathGroup: {
    "contexts": [],
    "groups": [{
      "options": {
        "agentsAspect": 32255,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 50,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 1,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 67,
        "1": 28.200000762939453
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsAspect": 261637,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 50,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 2,
        "pathReverse": true,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G1",
      "pos": {
        "0": 96.4000015258789,
        "1": 72.9000015258789
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 126.0999984741211,
        "1": 47.5
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 36.599998474121094,
            "1": 46.29999923706055
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 67.30000305175781,
            "1": 46.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 95.69999694824219,
            "1": 47.5
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 126.0999984741211,
            "1": 47.5
          },
          "entities": {},
          "children": {},
          "id": "J3"
        }]
      }
    }],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  pathSize: {
    "contexts": [],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 500,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 35.425113677978516,
        "1": 50.41111373901367
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 126.98758697509766,
        "1": 51.00733184814453
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 2,
            "scalable": true
          },
          "pos": {
            "0": 47.26435470581055,
            "1": 50.581459045410156
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 8,
            "scalable": true
          },
          "pos": {
            "0": 68.132080078125,
            "1": 39.423614501953125
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }, {
          "options": {
            "width": 0.2,
            "radius": 2,
            "scalable": true
          },
          "pos": {
            "0": 88.7442855834961,
            "1": 63.01692199707031
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 7,
            "scalable": true
          },
          "pos": {
            "0": 106.54573059082031,
            "1": 36.357337951660156
          },
          "entities": {},
          "children": {},
          "id": "J3"
        }, {
          "options": {
            "width": 0.2,
            "radius": 2,
            "scalable": true
          },
          "pos": {
            "0": 129.20211791992188,
            "1": 50.581459045410156
          },
          "entities": {},
          "children": {},
          "id": "J4"
        }]
      }
    }],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  paths: {
    "contexts": [],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 81.80000305175781,
        "1": 44
      },
      "entities": {
        "path": "P6",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G1",
      "pos": {
        "0": 52.599998474121094,
        "1": 22.700000762939453
      },
      "entities": {
        "path": "P5",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G2",
      "pos": {
        "0": 17.799999237060547,
        "1": 22.700000762939453
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 26.899999618530273,
        "1": 59.5
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 26,
            "1": 43.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 27.600000381469727,
            "1": 22.5
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 42.400001525878906,
            "1": 12.600000381469727
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 73,
            "1": 12.300000190734863
          },
          "entities": {},
          "children": {},
          "id": "J3"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 99.4000015258789,
            "1": 13.199999809265137
          },
          "entities": {},
          "children": {},
          "id": "J4"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 120,
            "1": 12.100000381469727
          },
          "entities": {},
          "children": {},
          "id": "J5"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 133.10000610351562,
            "1": 16.299999237060547
          },
          "entities": {},
          "children": {},
          "id": "J6"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 139.6999969482422,
            "1": 36.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J7"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 139.10000610351562,
            "1": 62.79999923706055
          },
          "entities": {},
          "children": {},
          "id": "J8"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 134.10000610351562,
            "1": 81.9000015258789
          },
          "entities": {},
          "children": {},
          "id": "J9"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 104.30000305175781,
            "1": 88.5999984741211
          },
          "entities": {},
          "children": {},
          "id": "J10"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 63.5,
            "1": 87.5
          },
          "entities": {},
          "children": {},
          "id": "J11"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 45.099998474121094,
            "1": 84.69999694824219
          },
          "entities": {},
          "children": {},
          "id": "J12"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 26.899999618530273,
            "1": 70.80000305175781
          },
          "entities": {},
          "children": {},
          "id": "J13"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 26.899999618530273,
            "1": 59.5
          },
          "entities": {},
          "children": {},
          "id": "J14"
        }]
      }
    }, {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P5",
      "pos": {
        "0": 47.5,
        "1": 56.900001525878906
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 48.79999923706055,
            "1": 41
          },
          "entities": {},
          "children": {},
          "id": "J39"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 77.5999984741211,
            "1": 32.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J40"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 96.30000305175781,
            "1": 32.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J41"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 122.80000305175781,
            "1": 47.29999923706055
          },
          "entities": {},
          "children": {},
          "id": "J42"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 122.4000015258789,
            "1": 65
          },
          "entities": {},
          "children": {},
          "id": "J43"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 97.30000305175781,
            "1": 72
          },
          "entities": {},
          "children": {},
          "id": "J44"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 62.900001525878906,
            "1": 71.5999984741211
          },
          "entities": {},
          "children": {},
          "id": "J45"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 47.5,
            "1": 56.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J46"
        }]
      }
    }, {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P6",
      "pos": {
        "0": 101.30000305175781,
        "1": 51
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 67.5999984741211,
            "1": 51.70000076293945
          },
          "entities": {},
          "children": {},
          "id": "J47"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 101.30000305175781,
            "1": 51
          },
          "entities": {},
          "children": {},
          "id": "J48"
        }]
      }
    }],
    "walls": []
  },

  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  wall: {
    "contexts": [],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 68.80000305175781,
        "1": 65.5
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 48,
        "1": 40.900001525878906
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 90.0999984741211,
            "1": 40.79999923706055
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 48,
            "1": 40.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J3"
        }]
      }
    }],
    "walls": [{
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W0",
      "pos": {
        "0": 67.30000305175781,
        "1": 53.20000076293945
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 67.4000015258789,
            "1": 32
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 67.30000305175781,
            "1": 53.20000076293945
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }]
      }
    }]
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  wallPass: {
    "contexts": [{
      "options": {
        "mobility": 1,
        "triggerOnEmpty": false,
        "width": 11.423812252927874,
        "height": 24.94855936539136
      },
      "id": "C0",
      "pos": {
        "0": 38.53074645996094,
        "1": 44.29106140136719
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.8,
        "agentsCount": 100,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 2,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0,
        "near": 10
      },
      "id": "G0",
      "pos": {
        "0": 28.354360580444336,
        "1": 44.29106140136719
      },
      "entities": {
        "path": "P2",
        "startContext": "C0",
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P2",
      "pos": {
        "0": 52.597679138183594,
        "1": 44.46891784667969
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 0.5,
            "scalable": true
          },
          "pos": {
            "0": 53.67130661010742,
            "1": 43.89921951293945
          },
          "entities": {},
          "children": {},
          "id": "J16"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": true
          },
          "pos": {
            "0": 67.78925323486328,
            "1": 43.67342758178711
          },
          "entities": {},
          "children": {},
          "id": "J18"
        }]
      }
    }],
    "walls": [{
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W0",
      "pos": {
        "0": 54.961639404296875,
        "1": 27.42833137512207
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 52.41826248168945,
            "1": 25.48590850830078
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 0.1,
            "scalable": false
          },
          "pos": {
            "0": 53.86460876464844,
            "1": 42.5235710144043
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 0.1,
            "scalable": false
          },
          "pos": {
            "0": 54.79446792602539,
            "1": 42.49207305908203
          },
          "entities": {},
          "children": {},
          "id": "J4"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 54.73858642578125,
            "1": 25.48590850830078
          },
          "entities": {},
          "children": {},
          "id": "J6"
        }]
      }
    }, {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W2",
      "pos": {
        "0": 54.961639404296875,
        "1": 56.580596923828125
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 52.9486198425293,
            "1": 61.61668395996094
          },
          "entities": {},
          "children": {},
          "id": "J8"
        }, {
          "options": {
            "width": 0.2,
            "radius": 0.1,
            "scalable": false
          },
          "pos": {
            "0": 54.020259857177734,
            "1": 44.71683883666992
          },
          "entities": {},
          "children": {},
          "id": "J10"
        }, {
          "options": {
            "width": 0.2,
            "radius": 0.1,
            "scalable": false
          },
          "pos": {
            "0": 54.90620803833008,
            "1": 44.72572326660156
          },
          "entities": {},
          "children": {},
          "id": "J12"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 55.26894760131836,
            "1": 61.55038833618164
          },
          "entities": {},
          "children": {},
          "id": "J14"
        }]
      }
    }]
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  wallsPathGr: {
    "contexts": [],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 200,
        "agentsMax": 200,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 12,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 47.6134147644043,
        "1": 47.2495002746582
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 200
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 86.5999984741211,
        "1": 45.400001525878906
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": true
          },
          "pos": {
            "0": 86.5999984741211,
            "1": 45.400001525878906
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }, {
          "options": {
            "width": 0.2,
            "radius": 10,
            "scalable": true
          },
          "pos": {
            "0": 116.0999984741211,
            "1": 45.29999923706055
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }]
      }
    }],
    "walls": [{
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W0",
      "pos": {
        "0": 118.80000305175781,
        "1": 22.700000762939453
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 53.099998474121094,
            "1": 22.399999618530273
          },
          "entities": {},
          "children": {},
          "id": "J3"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 80.21202087402344,
            "1": 42.68868637084961
          },
          "entities": {},
          "children": {},
          "id": "J5"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 92.69818115234375,
            "1": 43.51112747192383
          },
          "entities": {},
          "children": {},
          "id": "J6"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 118.80000305175781,
            "1": 22.700000762939453
          },
          "entities": {},
          "children": {},
          "id": "J8"
        }]
      }
    }, {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W1",
      "pos": {
        "0": 115.30000305175781,
        "1": 70.69999694824219
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 52.599998474121094,
            "1": 70.9000015258789
          },
          "entities": {},
          "children": {},
          "id": "J9"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 80.36155700683594,
            "1": 48.14670944213867
          },
          "entities": {},
          "children": {},
          "id": "J11"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 93.072021484375,
            "1": 46.72612762451172
          },
          "entities": {},
          "children": {},
          "id": "J12"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 115.30000305175781,
            "1": 70.69999694824219
          },
          "entities": {},
          "children": {},
          "id": "J13"
        }]
      }
    }]
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  pathContexts: {
    "contexts": [{
      "options": {
        "width": 10.800003051757812,
        "height": 28.400001525878906
      },
      "id": "C0",
      "pos": {
        "0": 34.400001525878906,
        "1": 45
      },
      "entities": {},
      "children": {}
    }, {
      "options": {
        "width": 9.600000000000023,
        "height": 31.400001525878906
      },
      "id": "C1",
      "pos": {
        "0": 130.8000030517578,
        "1": 45.20000076293945
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 500,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.1,
        "startRate": 10,
        "endProb": 0.2,
        "endRate": 5
      },
      "id": "G0",
      "pos": {
        "0": 83.80000305175781,
        "1": 72
      },
      "entities": {
        "path": "P1",
        "startContext": "C0",
        "endContext": "C1"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 117.5,
        "1": 45.400001525878906
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 48.79999923706055,
            "1": 45.5
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 82.4000015258789,
            "1": 45.70000076293945
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 117.5,
            "1": 45.400001525878906
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }]
      }
    }],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  pathCtxGro: {
    "contexts": [{
      "options": {
        "width": 14.399999237060541,
        "height": 37.400000000000006
      },
      "id": "C0",
      "pos": {
        "0": 30,
        "1": 43.20000076293945
      },
      "entities": {},
      "children": {}
    }, {
      "options": {
        "width": 8.600003051757824,
        "height": 53.79999923706055
      },
      "id": "C1",
      "pos": {
        "0": 127.5999984741211,
        "1": 48.29999923706055
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 6,
        "startProb": 0.05,
        "startRate": 2,
        "endProb": 0.1,
        "endRate": 2
      },
      "id": "G0",
      "pos": {
        "0": 80.0999984741211,
        "1": 19.899999618530273
      },
      "entities": {
        "path": "P1",
        "startContext": "C0",
        "endContext": "C1"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 3,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 6,
        "startProb": 0.05,
        "startRate": 2,
        "endProb": 0.1,
        "endRate": 2
      },
      "id": "G1",
      "pos": {
        "0": 80.5,
        "1": 68.5
      },
      "entities": {
        "path": "P1",
        "startContext": "C1",
        "endContext": "C0"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 115.80000305175781,
        "1": 46.599998474121094
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 46.099998474121094,
            "1": 46.70000076293945
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 8,
            "scalable": true
          },
          "pos": {
            "0": 67.9000015258789,
            "1": 46.5
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }, {
          "options": {
            "width": 0.2,
            "radius": 8,
            "scalable": true
          },
          "pos": {
            "0": 95.0999984741211,
            "1": 46.29999923706055
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 115.80000305175781,
            "1": 46.599998474121094
          },
          "entities": {},
          "children": {},
          "id": "J3"
        }]
      }
    }],
    "walls": []
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  rooms: {
    "contexts": [{
      "options": {
        "width": 17.263547386260512,
        "height": 10.835629013243675
      },
      "id": "C0",
      "pos": {
        "0": 58,
        "1": 13
      },
      "entities": {},
      "children": {}
    }, {
      "options": {
        "width": 12.00000076293945,
        "height": 21.599999999999994
      },
      "id": "C1",
      "pos": {
        "0": 20.299999237060547,
        "1": 45.5
      },
      "entities": {},
      "children": {}
    }, {
      "options": {
        "width": 14.399996948242176,
        "height": 13.20000610351562
      },
      "id": "C2",
      "pos": {
        "0": 114,
        "1": 74
      },
      "entities": {},
      "children": {}
    }],
    "groups": [{
      "options": {
        "agentsAspect": 16711680,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.01,
        "startRate": 5,
        "endProb": 0.8,
        "endRate": 1
      },
      "id": "G0",
      "pos": {
        "0": 81,
        "1": 9
      },
      "entities": {
        "path": "P2",
        "startContext": "C0",
        "endContext": "C2"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsAspect": 65280,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 2,
        "pathReverse": true,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.05,
        "startRate": 2,
        "endProb": 0.1,
        "endRate": 3
      },
      "id": "G2",
      "pos": {
        "0": 110,
        "1": 16
      },
      "entities": {
        "path": "P2",
        "startContext": "C2",
        "endContext": "C0"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsAspect": 11184810,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G3",
      "pos": {
        "0": 38.79999923706055,
        "1": 79.19999694824219
      },
      "entities": {
        "path": "P1",
        "startContext": "C1",
        "endContext": "C2"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }, {
      "options": {
        "agentsAspect": 255,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 3,
        "pathReverse": true,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.5,
        "startRate": 1,
        "endProb": 0.5,
        "endRate": 2
      },
      "id": "G4",
      "pos": {
        "0": 73,
        "1": 82.80000305175781
      },
      "entities": {
        "path": "P1",
        "startContext": "C2",
        "endContext": "C1"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }],
    "paths": [{
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 102,
        "1": 60
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 3,
            "scalable": true
          },
          "pos": {
            "0": 29.700000762939453,
            "1": 45.599998474121094
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 3,
            "scalable": true
          },
          "pos": {
            "0": 51.79999923706055,
            "1": 47
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }, {
          "options": {
            "width": 0.2,
            "radius": 3,
            "scalable": true
          },
          "pos": {
            "0": 84.5,
            "1": 47.70000076293945
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 100.0999984741211,
            "1": 59.5
          },
          "entities": {},
          "children": {},
          "id": "J3"
        }]
      }
    }, {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P2",
      "pos": {
        "0": 111,
        "1": 57
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 58,
            "1": 24
          },
          "entities": {},
          "children": {},
          "id": "J4"
        }, {
          "options": {
            "width": 0.2,
            "radius": 3,
            "scalable": true
          },
          "pos": {
            "0": 69.5,
            "1": 43.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J5"
        }, {
          "options": {
            "width": 0.2,
            "radius": 4,
            "scalable": true
          },
          "pos": {
            "0": 111,
            "1": 57
          },
          "entities": {},
          "children": {},
          "id": "J6"
        }]
      }
    }],
    "walls": [{
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W0",
      "pos": {
        "0": 31,
        "1": 41
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 29.600000381469727,
            "1": 20
          },
          "entities": {},
          "children": {},
          "id": "J0"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 48,
            "1": 20
          },
          "entities": {},
          "children": {},
          "id": "J1"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 48,
            "1": 35
          },
          "entities": {},
          "children": {},
          "id": "J2"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 31,
            "1": 35
          },
          "entities": {},
          "children": {},
          "id": "J3"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 31,
            "1": 41
          },
          "entities": {},
          "children": {},
          "id": "J4"
        }]
      }
    }, {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W1",
      "pos": {
        "0": 99,
        "1": 67
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 32,
            "1": 53
          },
          "entities": {},
          "children": {},
          "id": "J5"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 60,
            "1": 53
          },
          "entities": {},
          "children": {},
          "id": "J6"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 77,
            "1": 54
          },
          "entities": {},
          "children": {},
          "id": "J7"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 81,
            "1": 67
          },
          "entities": {},
          "children": {},
          "id": "J8"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 99,
            "1": 67
          },
          "entities": {},
          "children": {},
          "id": "J9"
        }]
      }
    }, {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W2",
      "pos": {
        "0": 124,
        "1": 66
      },
      "entities": {},
      "children": {
        "joints": [{
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 70,
            "1": 22
          },
          "entities": {},
          "children": {},
          "id": "J10"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 70,
            "1": 37
          },
          "entities": {},
          "children": {},
          "id": "J11"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 97,
            "1": 37
          },
          "entities": {},
          "children": {},
          "id": "J12"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 123.5999984741211,
            "1": 37.900001525878906
          },
          "entities": {},
          "children": {},
          "id": "J13"
        }, {
          "options": {
            "width": 0.2,
            "radius": 1,
            "scalable": false
          },
          "pos": {
            "0": 124,
            "1": 66
          },
          "entities": {},
          "children": {},
          "id": "J14"
        }]
      }
    }]
  },
  /*******************************************************************************************************************/
  /**
   * ****************************************************************************************************************
   * @method testFun
   * @param {} world
   * @param {} debug
   * @return 
   */
  testFun: function(world, debug) {
    // wire world events and adding entities functions
    var sizeR = 20;
    var sizeC = 10;
    var door = sizeR / 8;
    var cx = 55,
      cy = 45;
    var gx = 65,
      gy = 50;
    var radius = 4;
    var waypoints = [
      [10, 10],
      [20, 21],
      [31, 30],
      [41, 41],
      [41, 75],
      [55, 80],
      [65, 70],
      [65, 60]
    ];
    var path = new CrowdSim.Path(null, null, world);
    path.addJoints(waypoints);
    path.reverse();

    //var path = new CrowdSim.Path([{pos: [65, 60], radius: radius / 2}, {pos: [65, 70], radius: radius / 2}, {pos: [55, 80], radius: 2 * radius}]);

    var startContext = new CrowdSim.Context(gx, gy, world, {
      width: sizeC,
      height: sizeC
    });
    //var endContext = new CrowdSim.Context(55  , 80 - sizeC , sizeC, sizeC);
    var endContext = new CrowdSim.Context(10, 10, world, {
      width: sizeC,
      height: sizeC
    });
    var opts = {
      debug: debug,
      agentsCount: 10,
      agentsMax: 1000,
      agentsSizeMin: 0.5,
      agentsSizeMax: 0.6,
      startProb: 0.1,
      startRate: 1,
      endProb: 0.1,
      endRate: 1
    };
    var group = new CrowdSim.Group(60, 30, world, opts);
    group.assignStartContext(startContext);
    group.assignEndContext(endContext);
    group.assignPath(path);
    var room1 = [
      [cx + sizeR / 2 - door, cy + sizeR],
      [cx, cy + sizeR],
      [cx, cy],
      [cx + sizeR, cy],
      [cx + sizeR, cy + sizeR],
      [cx + sizeR / 2 + door, cy + sizeR]
    ];
    var room = [
      [cx + sizeR / 2 - door, cy + sizeR],
      [cx, cy + sizeR]
    ];
    //var wall = new CrowdSim.Wall(room);
    var wall = new CrowdSim.Wall(null, null, world);
    wall.addJoints(room1);
  },
  /*******************************************************************************************************************/
  /*******************************************************************************************************************/
  testJson: {
    'contexts': [{
      'options': {
        'width': 10,
        'height': 10
      },
      'pos': {
        '0': 65,
        '1': 50
      },
      'entities': {},
      'children': {},
      'id': 'C0'
    }, {
      'options': {
        'width': 10,
        'height': 10
      },
      'pos': {
        '0': 10,
        '1': 10
      },
      'entities': {},
      'children': {},
      'id': 'C1'
    }],
    'groups': [{
      'options': {
        'debug': false,
        'agentsCount': 10,
        'agentsMax': 1000,
        'agentsSizeMin': 0.5,
        'agentsSizeMax': 0.6,
        'startProb': 0.1,
        'startRate': 1,
        'endProb': 0.1,
        'endRate': 1,
        'pathStart': 0,
        'pathReverse': false,
        'pathCircular': false,
        'radius': 3
      },
      'pos': {
        '0': 60,
        '1': 30
      },
      'entities': {
        'path': 'P0',
        'startContext': 'C0',
        'endContext': 'C1'
      },
      'children': {},
      'id': 'G0',
      'behavior': {
        'world': {
          'options': {
            'width': 64,
            'height': 64
          },
          'entities': {}
        },
        'options': {
          'A': 2000,
          'B': 0.08,
          'kn': 120000,
          'Kv': 240000,
          'relaxationTime': 0.3
        }
      },
      'agentsCount': 10
    }],
    'paths': [{
      'options': {
        'width': 0.2,
        'radius': 4
      },
      'pos': {
        '0': 65,
        '1': 60
      },
      'entities': {},
      'children': {
        'joints': [{
          'options': {
            'width': 0.2,
            'radius': 4,
            'scalable': true
          },
          'pos': {
            '0': 65,
            '1': 60
          },
          'entities': {},
          'children': {},
          'id': 'J7'
        }, {
          'options': {
            'width': 0.2,
            'radius': 4,
            'scalable': true
          },
          'pos': {
            '0': 65,
            '1': 70
          },
          'entities': {},
          'children': {},
          'id': 'J6'
        }, {
          'options': {
            'width': 0.2,
            'radius': 4,
            'scalable': true
          },
          'pos': {
            '0': 55,
            '1': 80
          },
          'entities': {},
          'children': {},
          'id': 'J5'
        }, {
          'options': {
            'width': 0.2,
            'radius': 4,
            'scalable': true
          },
          'pos': {
            '0': 41,
            '1': 75
          },
          'entities': {},
          'children': {},
          'id': 'J4'
        }, {
          'options': {
            'width': 0.2,
            'radius': 4,
            'scalable': true
          },
          'pos': {
            '0': 41,
            '1': 41
          },
          'entities': {},
          'children': {},
          'id': 'J3'
        }, {
          'options': {
            'width': 0.2,
            'radius': 4,
            'scalable': true
          },
          'pos': {
            '0': 31,
            '1': 30
          },
          'entities': {},
          'children': {},
          'id': 'J2'
        }, {
          'options': {
            'width': 0.2,
            'radius': 4,
            'scalable': true
          },
          'pos': {
            '0': 20,
            '1': 21
          },
          'entities': {},
          'children': {},
          'id': 'J1'
        }, {
          'options': {
            'width': 0.2,
            'radius': 4,
            'scalable': true
          },
          'pos': {
            '0': 10,
            '1': 10
          },
          'entities': {},
          'children': {},
          'id': 'J0'
        }]
      },
      'id': 'P0'
    }],
    'walls': [{
      'options': {
        'width': 0.2,
        'radius': 1,
        'scalable': false
      },
      'pos': {
        '0': 67.5,
        '1': 65
      },
      'entities': {},
      'children': {
        'joints': [{
          'options': {
            'width': 0.2,
            'radius': 1,
            'scalable': false
          },
          'pos': {
            '0': 62.5,
            '1': 65
          },
          'entities': {},
          'children': {},
          'id': 'J8'
        }, {
          'options': {
            'width': 0.2,
            'radius': 1,
            'scalable': false
          },
          'pos': {
            '0': 55,
            '1': 65
          },
          'entities': {},
          'children': {},
          'id': 'J9'
        }, {
          'options': {
            'width': 0.2,
            'radius': 1,
            'scalable': false
          },
          'pos': {
            '0': 55,
            '1': 45
          },
          'entities': {},
          'children': {},
          'id': 'J10'
        }, {
          'options': {
            'width': 0.2,
            'radius': 1,
            'scalable': false
          },
          'pos': {
            '0': 75,
            '1': 45
          },
          'entities': {},
          'children': {},
          'id': 'J11'
        }, {
          'options': {
            'width': 0.2,
            'radius': 1,
            'scalable': false
          },
          'pos': {
            '0': 75,
            '1': 65
          },
          'entities': {},
          'children': {},
          'id': 'J12'
        }, {
          'options': {
            'width': 0.2,
            'radius': 1,
            'scalable': false
          },
          'pos': {
            '0': 67.5,
            '1': 65
          },
          'entities': {},
          'children': {},
          'id': 'J13'
        }]
      },
      'id': 'W0'
    }]
  }
};

module.exports = Worlds;

},{"CrowdSim":"CrowdSim"}]},{},[1])


//# sourceMappingURL=CrowdSimApp.js.map