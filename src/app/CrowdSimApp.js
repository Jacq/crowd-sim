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