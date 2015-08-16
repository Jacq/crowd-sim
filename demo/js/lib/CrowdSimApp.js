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
    scale: 10,
    MaxAgents: 1000, // to init particle container
    debug: true,
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

App.resize = function(window, width, height) {
  // to wait for fullscreen state
  setTimeout(function() {
    var w = width || window.innerWidth;
    var h = height || window.innerHeight;
    App._renderer.resize(w, h);
  }, 200);
};

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
  App._engine = new CrowdSim.Engine(App._world, {
      timeStepSize: 0.1, // time per step
      timeStepRun: 0.001 // time between step runnings
    });
  var events = {
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
    onCreateEntity: App.callbacks.onCreateEntity,
    onDestroyEntity: App.callbacks.onDestroyEntity
  };
  var world = App._world = new CrowdSim.World(this, optionsWorld);
  App._render();
};

App.save = function(save) {
  // TODO
  var raw = App._world.save(save);
  App.callbacks.onSave(App._world);
  return raw;
};

App.loadExample = function(name) {
  App.load(Worlds[name],false);
};

App.listExamples = function() {
  return Lazy(Worlds).keys().toArray();
};

App.load = function(loader, loadDefault) {
  App._world.load(loader,loadDefault);
  App._engine.setWorld(App._world);
  // loads all entities creating render objects
  Lazy(App._world.getEntitiesIterator()).each(function(entity) {
    App.addEntity(entity);
  });

  App.callbacks.onLoad(App._world);
};

App.onCreateAgents = function(agents) {
  Lazy(agents).each(function(a) {
    new Render.Agent(a);
  });
};

App.onDestroyAgents = function(agents) {
  Lazy(agents).each(function(a) {
    a.view.destroy();
  });
};

App.createEntityStart = function(entityType, pos) {
  var entity = entityType.CreateFromPoint(pos.x, pos.y, App._world);
  App._newRenderEntity = entity;
  if (App.callbacks.onCreateEntity) {
    App.callbacks.onCreateEntity(App._newRenderEntity);
  }
  return App._newRenderEntity;
};

// returns current entity creation of null if finished
App.getCreatingEntity = function() {
  return App._newRenderEntity;
};

App.createEntityEnd = function() {
  App._renderer.drawHelperLine(null);
  App._newRenderEntity = null;
  return null;
};

App.destroyEntity = function(entity) {
  entity.destroy();
  if (App._entitySelected === entity) {
    App.selectEntity(null);
  }
};

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

App.addEntity = function(entity) {
  var renderEntityProto = App.EntityCreationMapping[entity.constructor.type];
  var renderEntity = renderEntityProto.CreateFromModel(entity, App._world);
  if (App.callbacks.onCreateEntity) {
    App.callbacks.onCreateEntity(renderEntity);
  }
};

App.getEngineSettings = function() {
  return App._engine.getSettings();
};

App.zoom = function(scale, x, y) {
  App._renderer.zoom(scale, x, y);
};

App.pan = function(dx, dy) {
  App._renderer.pan(dx, dy);
};

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

App.getSelectedEntity = function() {
  return App._entitySelected;
};

App.selectEntityById = function(id) {
  var entity = App._world.getEntityById(id);
  App.selectEntity(entity.view);
};

/* Stagen a render entities mouse events */
App.entity = {};

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
  return false;
};

App.entityClick = function(pos, newEntity, selected) {
  if (newEntity instanceof Render.Joint) { // add joint to joint
    var existingJoint = newEntity.getJoint();
    existingJoint.parent.view.addJoint(pos.x, pos.y, {previousJoint: existingJoint});
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
    }
  }
};

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
App.mousemove = function(event) {
  // this points to the graphics/sprite
  if (App._newRenderEntity) {
    var origin = App._newRenderEntity.getPos();
    //var pos = event.data.getLocalPosition(this.parent);
    var pos = App._renderer.screenToWorld(event.clientX, event.clientY);
    App._renderer.drawHelperLine(origin[0], origin[1], pos.x, pos.y);
  }
};

App.mousewheel = function(event) {
  var entity = App._entitySelected;
  if (entity) {
    if (entity instanceof Render.Joint) {
      var joint  = entity.getJoint();
      joint.incrRadius(event.deltaY);
      return true;
    } else if (entity instanceof Render.Context) {
      var context  = entity.getContext();
      context.incrSize(event.deltaY);
      return true;
    }
  }
};

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

App.mouseup = function(event) {
  if (App.options.logEvents) {
    console.log(event);
  }
  // entities don't receive mouseup event when mouse is out
  App._globalMousePressed = false;
};

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

App.entity.mouseover = function(event) {
  if (App.options.logEvents) {
    console.log(event);
  }
  // this points to the graphics/sprite
  this.entity.hover = true;
  this.entity.tint = 0xFFFFFF;
};

App.screenToWorld = function(x, y) {
  return App._renderer.screenToWorld(x, y);
};
App.worldToScreen = function(x, y) {
  return App._renderer.worldToScreen(x, y);
};

App.toggleRun = function() {
  if (App.isRunning()) {
    return App.stop();
  } else {
    return App.run();
  }
};

App.isRunning = function() {
  return App._engine.running;
};

App.run = function() {
  var isRunning = App._engine.run();
  return isRunning;
};

App.stop = function() {
  var isRunning = App._engine.stop();
  return isRunning;
};

App.step = function() {
  App._engine.step();
};

App.reset = function() {
  App._engine.reset();
};

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

App.cycleDetail = function(entityType) {
  entityType.detail.cycleDetail();
};

App._render = function() {
  // callback prerender
  if (App.callbacks.onPreRender) {
    App.callbacks.onPreRender();
  }

  if (App._world) {

    var entities = App._world.entities;
    // render/refresh entities
    var agents = App._world.getAgents();
    for (var i in agents) {
      agents[i].view.render();
    }
    for (var prop in entities) {
      Lazy(entities[prop]).each(function(a) {
        if (a.view) { a.view.render(); }
      });
    }

  }

  // render the stage
  App._renderer.render();

  // callback postrender
  if (App.callbacks.onPostRender) {
    App.callbacks.onPostRender();
  }

  requestAnimationFrame(App._render);
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
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Agent = function(agent) {
  if (!agent) {
    throw 'Agent object must be defined';
  }
  //var display = new PIXI.Sprite(options.texture);

  Entity.call(this, agent);
  this.sprite = new PIXI.Sprite(Agent.texture);
  Entity.prototype.createGraphics.call(this,Agent.container, this.sprite);
  this.sprite.visible = Agent.detail.level > 0;
  this.sprite.anchor.set(0.5);
  //this.display.alpha = 0.5;
  var size = agent.size;
  this.sprite.height = size;
  this.sprite.width = size;
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

},{"./Base":3,"./Detail":5,"./Entity":6,"CrowdSim":"CrowdSim"}],3:[function(require,module,exports){
'use strict';

var Colors = {
  Hover: 0xebff00,
  Context: 0x646729,
  Agent: 0xFF0000,
  Group: 0xFFFFFF,
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

},{"./Base":3,"./Detail":5,"./Entity":6,"CrowdSim":"CrowdSim"}],5:[function(require,module,exports){
'use strict';

var Detail = function(maxDetail, detail) {
  this.maxDetail = maxDetail;
  this.level = detail || 1;
};

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

/*
* Base render prototype
*/
var Entity = function(entity) {
  if (!entity) {
    throw 'Entity undefined';
  }
  this.entityModel = entity;
  this.entityModel.view = this;
  this.selected = false;
};

Entity.prototype.destroy = function() {
  this.entityModel.view = null;
  this.entityModel.destroy();
  this.entityModel = null;
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
    //graphics.clear();
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

Entity.prototype.render = function(graphics) {
  //this.display.clear();
};

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

var Group = function(group) {
  if (!group) {
    throw 'Group object must be defined';
  }
  Entity.call(this, group);
};

Group.CreateFromModel = function(group) {
  return new Group(group);
};

Group.CreateFromPoint = function(x, y, parent, options) {
  var group = new GroupModel(x, y, parent, options);
  return new Group(group);
};

Group.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Group.container, this.graphics);
  Entity.prototype.destroy.call(this);
};

Group.prototype.createGraphics = function(group) {
  this.graphics = Entity.prototype.createGraphics.call(this,Group.container);
  this.label = new PIXI.Text(group.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  this.circle = new PIXI.Circle(group.pos[0], group.pos[1], group.getRadius());
  this.circle.entityModel = group;
  this.graphics.entity = this;
};

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
    this.graphics.beginFill(this.hover ? Colors.Hover : Colors.Group, this.hover ? 0.9 : 0.3);
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
      this.graphics.lineTo(start.pos[0],start.pos[1]);
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

Group.prototype.getAnchor = function(init) {
  var group = this.entityModel;
  return {x: group.pos[0], y: group.pos[1]};
};

Group.prototype.dragTo = function(pos, anchor) {
  var group = this.entityModel;
  group.pos[0] = pos.x;
  group.pos[1] = pos.y;
};

Group.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

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

var Joint = function(joint, texture) {
  if (!joint) {
    throw 'Joint object must be defined';
  }
  Entity.call(this, joint);
  this.texture = texture;
};

Joint.prototype.destroy = function(graphics) {
  this.graphics.removeChild(this.label);
  this.label.destroy();
  Entity.prototype.destroyGraphics.call(this, this.graphics , this.sprite);
  Entity.prototype.destroy.call(this);
};

Joint.prototype.createGraphics = function(graphics) {
  this.graphics = graphics;
  var joint = this.entityModel;
  this.label = new PIXI.Text(joint.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  graphics.addChild(this.label);
  this.sprite = new PIXI.Sprite(this.texture);
  Entity.prototype.createGraphics.call(this, graphics, this.sprite);
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.sprite.entity = this;
  this.sprite.alpha = 0.5;
  this.render();
};

Joint.prototype.render = function() {
  this.sprite.x = this.entityModel.pos[0];
  this.sprite.y = this.entityModel.pos[1];
  this.sprite.width = 2 * this.entityModel.getRadius();
  this.sprite.height = 2 * this.entityModel.getRadius();
  this.sprite.tint = this.hover ? Colors.Hover : Colors.Joint;
  this.label.x = this.sprite.x - this.label.width / 3;
  this.label.y = this.sprite.y - this.label.height / 2;
};

Joint.prototype.getAnchor = function(init) {
  return {x: this.entityModel.pos[0], y: this.entityModel.pos[1]};
};

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

Joint.prototype.getJoint = function() {
  return this.entityModel;
};

Joint.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

module.exports = Joint;

},{"./Base":3,"./Detail":5,"./Entity":6,"CrowdSim":"CrowdSim"}],9:[function(require,module,exports){
'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var LinePrototype = function(color) {

  var Line = function(line) {
    if (!line) {
      throw 'Line object must be defined';
    }
    Entity.call(this, line);
  };

  Line.prototype.destroy = function() {
    this.graphics.removeChild(this.label);
    this.label.destroy();
    Entity.prototype.destroyGraphics.call(this, Line.container, this.graphics);
    Entity.prototype.destroy.call(this);
  };

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

  Line.prototype.addJointFromModel = function(joint) {
    var renderJoint = new Joint(joint, Line.texture);
    renderJoint.createGraphics(this.graphics);
    return renderJoint;
  };

  Line.prototype.addJoint = function(x, y, options) {
    var line = this.entityModel;
    var jt = line.addJoint(x, y, options);
    return this.addJointFromModel(jt);
  };

  Line.prototype.render = function(options) {
    if (!Line.detail.level) {
      this.graphics.clear();
      return;
    }
    Entity.prototype.render.call(this, this.graphics);
    var line = this.entityModel;
    var jts = line.getJoints();
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
      for (var i = 0; i < jts.length; i++) {
        points.push(jts[i].pos[0], jts[i].pos[1]);
        jts[i].view.render();
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

Path.CreateFromModel = function(path) {
  return new Path(path);
};

Path.CreateFromPoint = function(x, y, parent, options) {
  var path = new PathModel(x, y, parent, options);
  return new Path(path);
};

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

var Render = function(canvas, w, h, options) {
  this.options = Lazy(options).defaults(Render.defaults).toObject();
  // create a renderer instance.
  this._renderer = PIXI.autoDetectRenderer(w, h);
  this._renderer.autoResize = true;
  // add the renderer view element to the DOM
  canvas.appendChild(this._renderer.view);

  // create root container
  this._stage = new PIXI.Container();
  this._stage.scale.x = this.options.scale;
  this._stage.scale.y = this.options.scale; // 10pix ~ 1m
  // create agents container
  this._worldContainer = new PIXI.Container();
  this._agentsContainer = new PIXI.ParticleContainer(this.options.maxAgents, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });
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

Render.prototype.render = function() {
  this._renderer.render(this._stage);
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
  scale: 10,
  mxAgents: 1000, // to init particle container
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

Wall.CreateFromModel = function(wall) {
  return new Wall(wall);
};

Wall.CreateFromPoint = function(x, y, parent, options) {
  var wall = new WallModel(x, y, parent, options);
  return new Wall(wall);
};

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
    world1: function(world, debug) {
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
    world2: {
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