'use strict';

var CrowdSim = require('CrowdSim');
var Render = require('./Render/Render');
var Worlds = require('./Worlds');

/**
 * @class CrowdSimApp
 * @type {Object}
 */
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
       * Callback on simulation stop.
       *
       * @method onStop
       * @param {Entity} entity that triggered the stop
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
 * Inicialization of application.
 *
 * @method init
 * @param {Canvas} canvas to render scene.
 * @param {Object} options
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
 * Resizes the scene.
 *
 * @method resize
 * @param {Window} window to use the current width or height
 * @param {Number} width
 * @param {Number} height
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
 * Zoom in a position.
 *
 * @method zoom
 * @param {Number} scale
 * @param {Number} x
 * @param {Number} y
 */
App.zoom = function(scale, x, y) {
  App._renderer.zoom(scale, x, y);
};

/**
 * Displace scene view.
 *
 * @method pan
 * @param {Number} dx
 * @param {Number} dy
 */
App.pan = function(dx, dy) {
  App._renderer.pan(dx, dy);
};

/**
 * Convert screen to world coordinates.
 *
 * @method screenToWorld
 * @param {Number} x
 * @param {Number} y
 * @return {Vec2} world coordinates
 */
App.screenToWorld = function(x, y) {
  return App._renderer.screenToWorld(x, y);
};
/**
 * Convert world toscreen coordinates.
 *
 * @method worldToScreen
 * @param {Number} x
 * @param {Number} y
 * @return {Vec2} screen coordinates
 */
App.worldToScreen = function(x, y) {
  return App._renderer.worldToScreen(x, y);
};

/**
 * Start/stop simulation.
 *
 * @method toggleRun
 * @return {Boolean} true if running; false otherwise
 */
App.toggleRun = function() {
  if (App.isRunning()) {
    return App.stop();
  } else {
    return App.run();
  }
};

/**
 * Gets engine running state.
 *
 * @method isRunning
 * @return {Boolean} true if running; false otherwise
 */
App.isRunning = function() {
  return App._engine.running;
};

/**
 * Start simulation.
 *
 * @method run
 * @return {Boolean} true if running; false otherwise
 */
App.run = function() {
  return App._engine.run();
};

/**
 * Stop simulation.
 *
 * @method stop
 * @return {Boolean} true if running; false otherwise
 */
App.stop = function() {
  return App._engine.stop();
};

/**
 * Step and stop simulation.
 *
 * @method step
 * @return {Boolean} true if running; false otherwise
 */
App.step = function() {
  return App._engine.step();
};

/**
 * Resert simulation.
 *
 * @method reset
 * @return {Boolean} true if running; false otherwise
 */
App.reset = function() {
  return App._engine.reset();
};

/**
 * Get simulation statistics.
 *
 * @method getStats
 * @return {Object} stats
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
 * Cycle an entity detail level.
 *
 * @method cycleDetail
 * @param {EntityTypes} entityType
 */
App.cycleDetail = function(entityType) {
  entityType.detail.cycleDetail();
};

/**
 * Get simulation engine time settings.
 *
 * @method getEngineSettings
 * @return {Object} [engine.options]
 */
App.getEngineSettings = function() {
  return App._engine.getSettings();
};

/**
 * Save current world.
 *
 * @method save
 * @param {Boolean} save true to save; false to return String
 * @return {String} raw
 */
App.save = function(save) {
  var raw = App._world.save(save);
  App.callbacks.onSave(App._world);
  return raw;
};

/**
 * Load an example world by its name.
 *
 * @method loadExample
 * @param {String} name
 */
App.loadExample = function(name) {
  App._renderer.stop();
  App.load(Worlds[name], false);
  App._renderer.start();
};

/**
 * Get a list of example worlds.
 *
 * @method listExamples
 * @return {Array} world names
 */
App.listExamples = function() {
  return Lazy(Worlds).keys().toArray();
};

/**
 * Clear current world.
 *
 * @method clear
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
 * Load a world.
 *
 * @method load
 * @param {String} loader JSON structure
 * @param {Boolean} loadDefault true to load last snapshoot
 */
App.load = function(loader, loadDefault) {
  this.clear();
  App.selectEntity(null);
  App.createEntityEnd();
  App._world.load(loader, loadDefault);
  App._engine.setWorld(App._world);
  App._renderer.setWorld(App._world);
  // loads all entities creating render objects
  Lazy(App._world.getEntitiesIterator()).each(function(entity) {
    App.addEntity(entity);
  });

  App.callbacks.onLoad(App._world);
};

/**
 * Callback on create agents.
 *
 * @method onCreateAgents
 * @param {Array} agents created.
 */
App.onCreateAgents = function(agents) {
  Lazy(agents).each(function(a) {
    new Render.Agent(a);
  });
};

/**
 * Callback on destroy agents.
 *
 * @method onDestroyAgents
 * @param {Array} agents destroyed
 */
App.onDestroyAgents = function(agents) {
  Lazy(agents).each(function(a) {
    a.view.destroy();
  });
};

/**
 * Callback on create entity.
 *
 * @method onCreateEntity
 * @param {Entity} entity created
 */
App.onCreateEntity = function(entity) {
  if (App.callbacks.onCreateEntity) {
    App.callbacks.onCreateEntity(entity);
  }
};

/**
 * Callback on destroy entity.
 *
 * @method onDestroyEntity
 * @param {Entity} entity destroyedn
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
 * Request to create an entity at a give pos.
 *
 * @method createEntityStart
 * @param {EntityTypes} entityType
 * @param {Vec2} pos
 * @return {Render.Entity}
 */
App.createEntityStart = function(entityType, pos) {
  var entity = entityType.CreateFromPoint(pos.x, pos.y, App._world);
  App._newRenderEntity = entity;
  return App._newRenderEntity;
};

/**
 * Request current entity creation of null if finished
 *
 * @method getCreatingEntity
 * @return {Render.Entity}
 */
App.getCreatingEntity = function() {
  return App._newRenderEntity;
};

/**
 * Request to end the creation of the current entity.
 *
 * @method createEntityEnd
 * @return {Object} null
 */
App.createEntityEnd = function() {
  App._renderer.drawHelperLine(null);
  App._newRenderEntity = null;
  return null;
};

/**
 * Destroy an entity.
 *
 * @method destroyEntity
 * @param {Render.Entity} entity
 */
App.destroyEntity = function(entity) {
  entity.destroy();
  if (App._entitySelected === entity) {
    App.selectEntity(null);
  }
};

/**
 * Edit an entity starting is creation mode.
 *
 * @method editEntity
 * @param {Render.Entity} entity
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
 * Add a existing entity.
 *
 * @method addEntity
 * @param {Entity} entity
 */
App.addEntity = function(entity) {
  var renderEntityProto = App.EntityCreationMapping[entity.constructor.type];
  var renderEntity = renderEntityProto.CreateFromModel(entity, App._world);
};

/**
 * Sets the current selected entitiy.
 *
 * @method selectEntity
 * @param {Render.Entity} entity
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
 * Gets the current selected entity.
 *
 * @method getSelectedEntity
 * @return {Render.Entity}
 */
App.getSelectedEntity = function() {
  return App._entitySelected;
};

/**
 * Set the current selected entity by its id
 *
 * @method selectEntityById
 * @param {String} id
 */
App.selectEntityById = function(id) {
  var entity = App._world.getEntityById(id);
  if (entity) {
    App.selectEntity(entity.view);
  }
};

////////////////// Stage render entities mouse events ///////////////
App.entity = {};

/**
 * Entity mouse down event.
 *
 * @method mousedown
 * @param {Object} event
 * @return {Boolean}
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
 * Stage entity click event, creation of new entities.
 *
 * @method entityClick
 * @param {Vec2} pos
 * @param {Render.Entity} newEntity
 * @param {Render.Entity} selected
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

/**
 * Stage mouse down event, creation of entities steps
 *
 * @method mousedown
 * @param {Object} event
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
 * Entity mouse move event
 *
 * @method mousemove
 * @param {Object} event
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

/**
 * Stage mouse move event, helper lines.
 *
 * @method mousemove
 * @param {Object} event
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
 * Stage mouse wheel event, zoom and radius change.
 *
 * @method mousewheel
 * @param {Object} event
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
 * Entity mouse up evenp.
 *
 * @method mouseup
 * @param {Object} event
 * @return {Boolean}
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
 * Stage mouse up event.
 *
 * @method mouseup
 * @param {Object} event
 */
App.mouseup = function(event) {
  if (App.options.logEvents) {
    console.log(event);
  }
  // entities don't receive mouseup event when mouse is out
  App._globalMousePressed = false;
};

/**
 * Entity mouse out event.
 *
 * @method mouseout
 * @param {Object} event
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
 * Entity mouse over event.
 *
 * @method mouseover
 * @param {Object} event
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
