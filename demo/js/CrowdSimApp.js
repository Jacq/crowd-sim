/* global window,CrowdSim, define */
var CrowdSimApp = (function() {
  'use strict';

  var App = {
    // callbacks
    onPreRender: null,
    onPostRender: null,
    EntityTypes: {
      Agent: CrowdSim.Render.Agent,
      Group: CrowdSim.Render.Group,
      Context: CrowdSim.Render.Context,
      Path: CrowdSim.Render.Path,
      Wall: CrowdSim.Render.Wall
    }
  };

  var defaultOptions = {
    interactive: true,
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
    if (options.interactive) {
      App.interactive = options.interactive;
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

    if (App.interactive) {
      App._events(App._stage, canvas);
    }

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

  App.addContext = function(context) {
    App._world.addContext(context);
    new CrowdSim.Render.Context(context);
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
    new CrowdSim.Render.Group(group);
  };

  App.addPath = function(path) {
    App._world.addPath(path);
    new CrowdSim.Render.Path(path, App._pathTexture);
  };

  App.addWall = function(wall) {
    App._world.addWall(wall);
    new CrowdSim.Render.Wall(wall, App._wallTexture);
  };

  App.load = function(w, h) {
    App._world = new CrowdSim.World(0, 0, w, h);
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
    var gx = 60, gy = 46;
    var radius = 4;
    var path = new CrowdSim.Path([{pos: [10, 10], radius: radius}, {pos: [20, 21], radius: radius}, {pos: [31, 30], radius: radius},
                                {pos: [41, 41], radius: radius}, {pos: [41, 75], radius: radius}, {pos: [55, 80], radius: radius},
                                {pos: [65, 70], radius: radius}, {pos: [65, 60], radius: radius}]);
    path.reverse();

    //var path = new CrowdSim.Path([{pos: [65, 60], radius: radius / 2}, {pos: [65, 70], radius: radius / 2}, {pos: [55, 80], radius: 2 * radius}]);

    var initContext = new CrowdSim.Context(gx, gy, sizeC, sizeC);
    //var endContext = new CrowdSim.Context(55  , 80 - sizeC , sizeC, sizeC);
    var endContext = new CrowdSim.Context(10 - sizeC / 2  , 10 - sizeC / 2 , sizeC, sizeC);
    var group = new CrowdSim.Group(10 , App._world, initContext, endContext, {debug: App.debug, start: {prob: 0.1, rate: 1, max: 1000},
                                                                                                 end: {prob: 0.1, rate: 1}});
    group.assignPath(path);
    var room1 = [[cx + sizeR / 2 - door, cy + sizeR], [cx, cy + sizeR], [cx, cy],
              [cx + sizeR, cy], [cx + sizeR, cy + sizeR], [cx + sizeR / 2 + door, cy + sizeR]];
    var room = [[cx + sizeR / 2 - door, cy + sizeR], [cx, cy + sizeR]];
    //var wall = new CrowdSim.Wall(room);
    var wall = new CrowdSim.Wall(room1);
    App.addContext(initContext);
    App.addContext(endContext);
    App.addGroup(group);
    App.addWall(wall);
    App.addPath(path);
  };

  App.zoom = function(value, x, y) {
    App._stage.x =  App._stage.x  - x * (value - 1);
    App._stage.y =  App._stage.y  - y * (value - 1);
    App._stage.scale.x *= value;
    App._stage.scale.y *= value;
  };

  App.pan = function(dx, dy) {
    App._stage.x += dx;
    App._stage.y += dy;
  };

  App._events = function(stage, canvas) {
    //App._stage.hitArea = new PIXI.Rectangle(0, 0, canvas.width, canvas.height);
    //App._stage.interactive = true;

    stage.mousedown = function(mouseData) {
      //App.mousedown = {x: mouseData.data.global.x, y: mouseData.data.global.y};
    };

    stage.mouseup = function(mouseData) {
      console.log(mouseData);
      //console.log('CLICK!');
      var defaultGroup = App._world.getDefaultGroup();
      var global = mouseData.data;
      var agent = new CrowdSim.Agent(global.x, global.y, 5);
      agent.extra.view = new CrowdSim.Render.Agent(agent, App._agentsContainer);
      defaultGroup.addAgent(agent);
      App._renderOnce();
    };
    stage.mousemove = function(mouseData) {

    };

  };

  App.scaleToWorld = function(x) {
    return x / App.scale;
  };

  App._initRender = function() {

    var baseTextures = PIXI.Texture.fromImage('img/flt.png');
    App._agentTexture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(26, 16, 51, 36));
    App._wallTexture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(274, 14, 32, 32));
    App._pathTexture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(326, 14, 32, 32));

    App._worldContainer.removeChildren();
    App._agentsContainer.removeChildren();
    // init debug container
    CrowdSim.Render.Context.container = App._worldContainer;
    CrowdSim.Render.Agent.container = App._agentsContainer;
    CrowdSim.Render.Agent.debugContainer = App._debugContainer;
    CrowdSim.Render.Wall.container = App._worldContainer;
    CrowdSim.Render.Group.container = App._worldContainer;
    CrowdSim.Render.Path.container = App._worldContainer;
    // to draw everything
    //App._renderOnce();
    requestAnimationFrame(App._render);
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
    requestAnimationFrame(App._render);
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

    // callback postrender
    if (App.onPostRender) {
      App.onPostRender();
    }
  };
  return App;
})();
//# sourceURL=CrowdSimApp.js
