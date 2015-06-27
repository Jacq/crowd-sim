/* global window,CrowdSim, define */
var CrowdSimApp = (function() {
  'use strict';

  var App = {
    // callbacks
    onPreRender: null,
    onPostRender: null,
    _selectedEntity: null
  };

  var defaultOptions = {
    debug: true,
    scale: 10,
    MaxAgents: 1000, // to init particle container
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

    var w = window.innerWidth;
    var h = window.innerHeight;

    // create a renderer instance.
    App._renderer = PIXI.autoDetectRenderer(w, h);

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

    function fullscreen() {
      if (App.canvas.webkitRequestFullScreen) {
        App.canvas.webkitRequestFullScreen();
      } else {
        App.canvas.mozRequestFullScreen();
      }
    }
    //var loader = new PIXI.AssetLoader(App.assets);
    App._initRender(App._world);
    App.load(w, h);
  };

  App.startCreateEntity = function(entityType, pos) {
    var entity = new entityType.constructor(pos.x,pos.y);
    App._newRenderEntity = entityType.add(entity);
    return App._newRenderEntity;
  };

  App.endCreateEntity = function() {
    App._newRenderEntity = null;
    return null;
  };

  App.addContext = function(context) {
    App._world.addContext(context);
    return new CrowdSim.Render.Context(context);
  };

  App.onCreateAgents = function(agents) {
    Lazy(agents).each(function(a) {
      new CrowdSim.Render.Agent(a, App._agentTexture);
    });
  };

  App.onDestroyAgents = function(agents) {
    Lazy(agents).each(function(a) {
      a.extra.view.destroy();
    });
  };

  App.addGroup = function(group) {
    App._world.addGroup(group);
    return new CrowdSim.Render.Group(group);
  };

  App.addPath = function(path) {
    App._world.addPath(path);
    return new CrowdSim.Render.Path(path, App._pathTexture);
  };

  App.addWall = function(wall) {
    App._world.addWall(wall);
    return new CrowdSim.Render.Wall(wall, App._wallTexture);
  };

  App.load = function(w, h) {
    var world = App._world = new CrowdSim.World(0, 0, w, h);
    App._world.onCreateAgents = App.onCreateAgents;
    App._world.onDestroyAgents = App.onDestroyAgents;

    App._engine = new CrowdSim.Engine(App._world, {
      timeStepSize: 0.1, // time per step
      timeStepRun: 0.001, // time between step runnings
      onStep: null
    });
    var sizeR = 20;
    var sizeC = 10;
    var door = sizeR / 8;
    var cx = 55, cy = 45;
    var gx = 65, gy = 50;
    var radius = 4;
    var opts = {waypoints: [{pos: [10, 10], radius: radius},{pos: [20, 21], radius: radius}, {pos: [31, 30], radius: radius},
                                {pos: [41, 41], radius: radius}, {pos: [41, 75], radius: radius}, {pos: [55, 80], radius: radius},
                                {pos: [65, 70], radius: radius}, {pos: [65, 60], radius: radius}]};
    var path = new CrowdSim.Path(10,10,world,opts);
    path.reverse();

    //var path = new CrowdSim.Path([{pos: [65, 60], radius: radius / 2}, {pos: [65, 70], radius: radius / 2}, {pos: [55, 80], radius: 2 * radius}]);

    var startContext = new CrowdSim.Context(gx, gy, world, {width: sizeC, height: sizeC});
    //var endContext = new CrowdSim.Context(55  , 80 - sizeC , sizeC, sizeC);
    var endContext = new CrowdSim.Context(10, 10,world, {width: sizeC, height: sizeC});
    opts = {debug: App.debug,
                agentsNumber: 10,
                start: {prob: 0.1, rate: 1, max: 1000},
                end: {prob: 0.1, rate: 1},
                startContext: startContext,
                endContext: endContext};
    var group = new CrowdSim.Group(10, 10, world, opts);
    group.assignPath(path);
    var room1 = [[cx + sizeR / 2 - door, cy + sizeR], [cx, cy + sizeR], [cx, cy],
              [cx + sizeR, cy], [cx + sizeR, cy + sizeR], [cx + sizeR / 2 + door, cy + sizeR]];
    var room = [[cx + sizeR / 2 - door, cy + sizeR], [cx, cy + sizeR]];
    //var wall = new CrowdSim.Wall(room);
    var wall = new CrowdSim.Wall(cx, cy, world, {path: room1});
    App.addContext(startContext);
    App.addContext(endContext);
    App.addGroup(group);
    App.addWall(wall);
    App.addPath(path);
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

  App.mousedown = function(event) {
    CrowdSim.Render.Entity.globalMousePressed = true;
    if (App._newRenderEntity) {
      var pos = App.screenToWorld(event.clientX,event.clientY);
      if (App._newRenderEntity instanceof CrowdSim.Render.Wall) { // add joint
        App._newRenderEntity.addPath([pos.x,pos.y]);
      } else if (App._newRenderEntity instanceof CrowdSim.Render.Path) { // add waypoint
        App._newRenderEntity.addWaypoint({pos: [pos.x,pos.y]}); // use default radius
      }
    }
  };

  App.mousemove = function(event) {

  };

  App.mouseup = function(event) {
    // to use in entities to end dragging action
    // entities don't receive mouseup event when mouse is out
    CrowdSim.Render.Entity.globalMousePressed = false;
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
    App._initRender();
  };

  App.addSingleAgent = function(x, y) {
    var defaultGroup = CrowdSimApp._world.getDefaultGroup();
    var global = mouseData.data;
    var agent = new CrowdSim.Agent(x, y, 5);
    agent.extra.view = new CrowdSim.Render.Agent(agent);
    defaultGroup.addAgent(agent);
    //CrowdSim._renderOnce();
  };

  App.getStats = function() {
    var entities = App._world.entities;
    return {
      running: App._engine.running,
      iterations: App._engine.iterations,
      contexts: entities.contexts.length,
      agents: entities.agents.length,
      groups: entities.groups.length,
      walls: entities.walls.length,
      paths: entities.paths.length,
      agent: App._world.agentSelected ? App._world.agentSelected.id : ''
    };
  };

  App.snapToGrid = function(enabled) {
    CrowdSim.Render.Entity.snapToGrid = enabled;
  };

  App.cycleDetail = function(entityType) {
    entityType.detail.cycleDetail();
  };

  App._initRender = function() {

    var baseTextures = PIXI.Texture.fromImage('img/flt.png');
    App._agentTexture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(26, 16, 51, 36));
    App._wallTexture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(274, 14, 32, 32));
    App._pathTexture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(326, 14, 32, 32));

    App._worldContainer.removeChildren();
    App._agentsContainer.removeChildren();
    // init default containers
    CrowdSim.Render.Context.container = App._worldContainer;
    CrowdSim.Render.Agent.container = App._agentsContainer;
    CrowdSim.Render.Agent.debugContainer = App._debugContainer;
    CrowdSim.Render.Wall.container = App._worldContainer;
    CrowdSim.Render.Group.container = App._worldContainer;
    CrowdSim.Render.Path.container = App._worldContainer;
    // to draw everything
    //App._renderOnce();

    // axis
    var graphicsAux = new PIXI.Graphics();
    graphicsAux.lineStyle(0.2, 0xFFFFFF);
    // x
    graphicsAux.moveTo(0, 0);
    graphicsAux.lineTo(10, 0);
    graphicsAux.moveTo(9, -1);
    graphicsAux.lineTo(10, 0);
    graphicsAux.lineTo(9, 1);
    // y
    graphicsAux.moveTo(0, 0);
    graphicsAux.lineTo(0, 10);
    graphicsAux.moveTo(-1, 9);
    graphicsAux.lineTo(0, 10);
    graphicsAux.lineTo(1, 9);
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
    for (var prop in entities) {
      Lazy(entities[prop]).each(function(a) {
        a.extra.view.render();
      });
    }

    // render the stage
    App._renderer.render(App._stage);
    requestAnimationFrame(App._render);

    // render selected entity indication
    if (App._newRenderEntity) {

    }

    // callback postrender
    if (App.onPostRender) {
      App.onPostRender();
    }
  };

  App.EntityTypes = {
    Agent: CrowdSim.Render.Agent,
    Group: {constructor: CrowdSim.Group, add: App.addGroup},
    Context: {constructor: CrowdSim.Context, add: App.addContext},
    Path: {constructor: CrowdSim.Path, add: App.addPath},
    Wall: {constructor: CrowdSim.Wall, add: App.addWall},
  };

  return App;
})();
//# sourceURL=CrowdSimApp.js
