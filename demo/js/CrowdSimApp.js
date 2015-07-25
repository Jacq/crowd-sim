/* global window,CrowdSim, define */
var CrowdSimApp = (function() {
  'use strict';

  var App = {
    // callbacks
    onPreRender: null, // before each render cycle
    onPostRender: null, // after each render cycle
    onCreateEntity: null, // on creation of complex entites
    onDestroyEntity: null, // on removing of complex entites
    onEntitySelected: null,
    onEntityUnSelected: null,
    onLoad: null, // when new world is loaded
    onSave: null, // when the current world is saved
    snapToGrid: false, // snaps the mouse position to a grid of integers
    entitySelected: null // holds the current selected entity
  };

  // wire entities <=> render entities association
  App.EntityTypes = {
    Agent: CrowdSim.Render.Agent,
    Group: CrowdSim.Render.Group,
    Context: CrowdSim.Render.Context,
    Path: CrowdSim.Render.Path,
    Wall: CrowdSim.Render.Wall,
  };

  var defaultOptions = {
    debug: true,
    scale: 10,
    MaxAgents: 1000, // to init particle container
  };

  App.resize = function(width, height) {
    // to wait for fullscreen state
    setTimeout(function() {
      var w = width || window.innerWidth;
      var h = height || window.innerHeight;
      console.log(w);
      console.log(h);
      App._renderer.resize(w, h);
    }, 100);
  };

  App.init = function(canvas, options) {
    options = options || defaultOptions;
    App.canvas = canvas;
    if (options.debug) {
      App.debug = options.debug;
    }
    if (options.scale) {
      App.scale = options.scale;
    }
    if (options.MaxAgents) {
      App.MaxAgents = options.MaxAgents;
    }

    var w = options.width || window.innerWidth;
    var h = options.height || window.innerHeight;

    // create a renderer instance.
    App._renderer = PIXI.autoDetectRenderer(w, h);
    App._renderer.autoResize = true;
    // add the renderer view element to the DOM
    canvas.appendChild(App._renderer.view);

    // create root container
    App._stage = new PIXI.Container();
    App._stage.scale.x = App.scale;
    App._stage.scale.y = App.scale; // 10pix ~ 1m
    // create agents container
    App._worldContainer = new PIXI.Container();
    App._agentsContainer = new PIXI.ParticleContainer(App.MaxAgents, {
      scale: true,
      position: true,
      rotation: true,
      uvs: true,
      alpha: true
    });
    App._stage.addChild(App._agentsContainer);
    App._stage.addChild(App._worldContainer);

    if (App.debug) {
      App._debugContainer = new PIXI.Container();
      App._stage.addChild(App._debugContainer);
    }
    App._initRender();
  };

  App.load = function() {
    var w = App._stage.width;
    var h = App._stage.height;
    var world = App._world = new CrowdSim.World(0, 0, w, h);
    // wire world events and functions
    App._world.onCreateAgents = App.onCreateAgents;
    App._world.onDestroyAgents = App.onDestroyAgents;
    App._world.onCreateEntity = App.onCreateEntity;
    App._world.onDestroyEntity = App.onDestroyEntity;
    App.EntityTypes.Group.add = App._world.addGroup.bind(App._world);
    App.EntityTypes.Context.add = App._world.addContext.bind(App._world);
    App.EntityTypes.Path.add = App._world.addPath.bind(App._world);
    App.EntityTypes.Wall.add = App._world.addWall.bind(App._world);

    App._engine = new CrowdSim.Engine(App._world, {
      timeStepSize: 0.1, // time per step
      timeStepRun: 0.001 // time between step runnings
    });
    var sizeR = 20;
    var sizeC = 10;
    var door = sizeR / 8;
    var cx = 55, cy = 45;
    var gx = 65, gy = 50;
    var radius = 4;
    var waypoints = [[10, 10], [20, 21], [31, 30], [41, 41], [41, 75], [55, 80], [65, 70], [65, 60]];
    var path = new CrowdSim.Path(null, null, world);
    path.addWaypoints(waypoints);
    path.reverse();

    //var path = new CrowdSim.Path([{pos: [65, 60], radius: radius / 2}, {pos: [65, 70], radius: radius / 2}, {pos: [55, 80], radius: 2 * radius}]);

    var startContext = new CrowdSim.Context(gx, gy, world, {width: sizeC, height: sizeC});
    //var endContext = new CrowdSim.Context(55  , 80 - sizeC , sizeC, sizeC);
    var endContext = new CrowdSim.Context(10, 10, world, {width: sizeC, height: sizeC});
    var opts = {debug: App.debug,
                agentsCount: 10,
                agentsMax: 1000,
                agentsSizeMin: 0.5,
                agentsSizeMax: 0.6,
                startProb: 0.1,
                startRate: 1,
                endProb: 0.1,
                endRate: 1};
    var group = new CrowdSim.Group(cx, cy, world, opts);
    group.assignStartContext(startContext);
    group.assignEndContext(endContext);
    group.assignPath(path);
    var room1 = [[cx + sizeR / 2 - door, cy + sizeR], [cx, cy + sizeR], [cx, cy],
              [cx + sizeR, cy], [cx + sizeR, cy + sizeR], [cx + sizeR / 2 + door, cy + sizeR]];
    var room = [[cx + sizeR / 2 - door, cy + sizeR], [cx, cy + sizeR]];
    //var wall = new CrowdSim.Wall(room);
    var wall = new CrowdSim.Wall(null, null, world);
    wall.addCorners(room1);
    App.addContext(startContext);
    App.addContext(endContext);
    App.addGroup(group);
    App.addWall(wall);
    App.addPath(path);
    App.onLoad(world);
  };

  App.save = function() {
    App.onSave(App._world);
  };

  App.onCreateAgents = function(agents) {
    Lazy(agents).each(function(a) {
      new CrowdSim.Render.Agent(a);
    });
  };

  App.onDestroyAgents = function(agents) {
    Lazy(agents).each(function(a) {
      a.view.destroy();
    });
  };

  App.startCreateEntity = function(entityType, pos) {
    var entity = entityType.CreateFromPoint(pos.x, pos.y, App._world);
    App._newRenderEntity = entity;
    return App._newRenderEntity;
  };

  App.endCreateEntity = function() {
    App._graphicsCreateEntity.clear();
    App._newRenderEntity = null;
    return null;
  };

  App.destroyEntity = function(entity) {
    entity.destroy();
    if (App.entitySelected === entity) {
      App.selectEntity(null);
    }
    App.onDestroyEntity(entity);
  };

  App.addEntity = function(entityType, entity) {
    var renderEntity = entityType.CreateFromModel(entity, App._world);
    if (App.onCreateEntity) {
      App.onCreateEntity(renderEntity);
    }
  };

  App.addContext = function(context) {
    return App.addEntity(App.EntityTypes.Context, context);
  };

  App.addGroup = function(group) {
    return App.addEntity(App.EntityTypes.Group, group);
  };

  App.addPath = function(path) {
    return App.addEntity(App.EntityTypes.Path, path);
  };

  App.addWall = function(wall) {
    return App.addEntity(App.EntityTypes.Wall, wall);
  };

  App.getEntineSettings = function() {
    return App._engine.getSettings();
  };

  App.zoom = function(scale, x, y) {
    scale = scale > 0 ? 1.1 : 0.9;
    var currentWorldPos = App.screenToWorld(x, y);
    App._stage.scale.x = App._stage.scale.x * scale;
    App._stage.scale.y = App._stage.scale.y * scale;
    var newScreenPos = App.worldToScreen(currentWorldPos.x, currentWorldPos.y);
    App._stage.x -= (newScreenPos.x - x) ;
    App._stage.y -= (newScreenPos.y - y) ;
  };

  App.pan = function(dx, dy) {
    App._stage.x += dx;
    App._stage.y += dy;
  };

  App.selectEntity = function(entity) {
    if (App.entitySelected) {
      // hack to hide in stage
      App.entitySelected.hover = false;
      if (App.onEntityUnSelected) {
        App.onEntityUnSelected(App.entitySelected);
      }
    }
    App.entitySelected = entity;
    if (entity) {
      // hack to show in stage
      entity.hover = true;
      if (App.onEntitySelected) {
        App.onEntitySelected(App.entitySelected);
      }
    }
  };

  App.selectEntityById = function(id) {
    var entity = App._world.getEntityById(id);
    App.selectEntity(entity.view);
  };

  /* Stagen a render entities mouse events */
  App.entity = {};

  App.entity.mousedown = function(event) {
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

  // stage mousedown
  App.mousedown = function(event) {
    App._globalMousePressed = true;
    switch (event.button) {
    case 0: // left button
      if (App._newRenderEntity) { // creating entities
        var pos = App.screenToWorld(event.clientX, event.clientY);
        if (App._newRenderEntity instanceof CrowdSim.Render.Wall) { // add joint
          App._newRenderEntity.addCorner(pos.x, pos.y);
        } else if (App._newRenderEntity instanceof CrowdSim.Render.Path) { // add waypoint
          App._newRenderEntity.addWaypoint(pos.x, pos.y); // use default radius
        } else if (App._newRenderEntity instanceof CrowdSim.Render.Context) { // add waypoint
          App._newRenderEntity.setArea(pos.x, pos.y);
        }
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
        if (App.entitySelected) {
          App.selectEntity(this.entity);
        }
        this.entity.dragTo(newPosition, this.mousedownAnchor);
      }
    }
  };

  // stage mousemove
  App.mousemove = function(event) {
    // this points to the graphics/sprite
    if (App._newRenderEntity) {
      var origin = App._newRenderEntity.entityModel.pos;
      //var pos = event.data.getLocalPosition(this.parent);
      var pos = App.screenToWorld(event.clientX, event.clientY);
      App._graphicsCreateEntity.clear();
      App._graphicsCreateEntity.lineStyle(0.2, 0xFFFFFF);
      App._graphicsCreateEntity.moveTo(origin[0], origin[1]);
      App._graphicsCreateEntity.lineTo(pos.x, pos.y);
    }
  };

  App.entity.mouseup = function(event) {
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
    // entities don't receive mouseup event when mouse is out
    App._globalMousePressed = false;
  };

  App.entity.mouseout = function(event) {
    // this points to the graphics/sprite
    this.entity.hover = false;
    this.entity.tint = 0x999999;
  };

  App.entity.mouseover = function(event) {
    // this points to the graphics/sprite
    this.entity.hover = true;
    this.entity.tint = 0xFFFFFF;
  };

  App.screenToWorld = function(x, y) {
    return {x: (x - App._stage.x) / App._stage.scale.x,
            y: (y - App._stage.y) / App._stage.scale.y};
  };
  App.worldToScreen = function(x, y) {
    return {x: x * App._stage.scale.x + App._stage.x,
            y: y * App._stage.scale.y + App._stage.y};
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

  App._initRender = function() {

    var baseTextures = PIXI.Texture.fromImage('img/flt.png');
    CrowdSim.Render.Agent.texture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(26, 16, 51, 36));
    CrowdSim.Render.Wall.texture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(274, 14, 32, 32));
    CrowdSim.Render.Path.texture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(326, 14, 32, 32));

    App._worldContainer.removeChildren();
    App._agentsContainer.removeChildren();
    // init default containers

    CrowdSim.Render.Agent.container = App._agentsContainer;
    CrowdSim.Render.Agent.debugContainer = App._debugContainer;
    CrowdSim.Render.Context.container = App._worldContainer;
    CrowdSim.Render.Group.container = App._worldContainer;
    CrowdSim.Render.Wall.container = App._worldContainer;
    CrowdSim.Render.Path.container = App._worldContainer;

    // to draw everything
    //App._renderOnce();

    // wire Entity events
    CrowdSim.Render.Entity.mouseover = App.entity.mouseover;
    CrowdSim.Render.Entity.mouseout = App.entity.mouseout;
    CrowdSim.Render.Entity.mousedown = App.entity.mousedown;
    CrowdSim.Render.Entity.mouseup = App.entity.mouseup;
    CrowdSim.Render.Entity.mousemove = App.entity.mousemove;

    // axis
    var graphicsAux = new PIXI.Graphics();
    graphicsAux.lineStyle(0.2, 0xFFFFFF);
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
    App._graphicsCreateEntity = new PIXI.Graphics();

    App._worldContainer.addChild(App._graphicsCreateEntity);
    App._worldContainer.addChild(graphicsAux);

    requestAnimationFrame(App._render);
  };

  App._renderOnce = function() {
    App.refreshOnce = true;
    requestAnimationFrame(App._render);
  };

  App._render = function() {
    // callback prerender
    if (App.onPreRender) {
      App.onPreRender();
    }

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

    // render the stage
    App._renderer.render(App._stage);
    requestAnimationFrame(App._render);

    // callback postrender
    if (App.onPostRender) {
      App.onPostRender();
    }
  };

  return App;
})();
//# sourceURL=CrowdSimApp.js
