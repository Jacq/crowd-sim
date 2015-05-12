/* global window,CrowdSim, define */
var CrowdSimApp = (function() {
  'use strict';

  var App = {
    // callbacks
    onPreRender: null,
    onPostRender: null,
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

    App.load(w, h);

    function fullscreen() {
      if (App.canvas.webkitRequestFullScreen) {
        App.canvas.webkitRequestFullScreen();
      } else {
        App.canvas.mozRequestFullScreen();
      }
    }
    //var loader = new PIXI.AssetLoader(App.assets);
    App._initRender(App._world);
  };

  App.load = function(w, h) {
    App._world = new CrowdSim.World(w, h);

    App._engine = new CrowdSim.Engine(App._world, {
      timeStepSize: 0.1, // time per step
      timeStepRun: 0.01, // time between step runnings
      onStep: null
    });
    var size = 20;
    var door = size / 8;
    var cx = 55, cy = 45;
    var gx = 60, gy = 46;
    var radius = 4;
    var path = new CrowdSim.Path([{pos: [10, 10], radius: radius}, {pos: [20, 21], radius: radius}, {pos: [31, 30], radius: radius},
                                {pos: [41, 41], radius: radius}, {pos: [41, 75], radius: radius}, {pos: [55, 80], radius: radius},
                                {pos: [65, 70], radius: radius}, {pos: [65, 60], radius: radius}]);
    path.reverse();
    var group = new CrowdSim.Group(100 , App._world, [[gx, gy], [gx + size / 2, gy + size / 2]], {debug: App.debug, birth: {prob: 0.1, rate: 1}});
    group.assignPath(path);
    var room1 = [[cx + size / 2 - door, cy + size], [cx, cy + size], [cx, cy], [cx + size, cy], [cx + size, cy + size], [cx + size / 2 + door, cy + size]];
    var room = [[cx + size / 2 - door, cy + size], [cx, cy + size]];
    //var wall = new CrowdSim.Wall(room);
    var wall = new CrowdSim.Wall(room1);
    App._world.addGroup(group);
    App._world.addWall(wall);
    App._world.addPath(path);
  };

  App.zoom = function(value, x, y) {
    if (!x || !y) {
      x = App._stage.width / 2;
      y = App._stage.width / 2;
    }
    App._stage.x += (1 - value) * x;
    App._stage.y += (1 - value) * y;
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

  /*App.scaleToWorld = function(x) {
    return x / App.scale;
  };*/

  App._initRender = function() {
    var baseTextures = PIXI.Texture.fromImage('img/flt.png');
    App._agentTexture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(26, 16, 51, 36));

    App.running = false;
    App._worldContainer.removeChildren();
    App._agentsContainer.removeChildren();
    var entities = App._world.entities;
    Lazy(entities.agents).each(function(a) {
      new CrowdSim.Render.Agent(a, App._agentsContainer, App._agentTexture, App._debugContainer);
    });
    Lazy(entities.walls).each(function(a) {
      new CrowdSim.Render.Wall(a, App._worldContainer);
    });
    Lazy(entities.groups).each(function(a) {
      new CrowdSim.Render.Group(a, App._worldContainer);
    });
    Lazy(entities.paths).each(function(a) {
      new CrowdSim.Render.Path(a, App._worldContainer);
    });

    App._renderOnce(); // to draw everything
    // canvas.addEventListener('click', fullscreen);
    //requestAnimFrame(App._render);
  };

  App.run = function() {
    App._engine.run();
    requestAnimationFrame(App._render);
    App.running = true;
  };

  App.stop = function() {
    App._engine.stop();
    App.running = false;
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
    agent.extra.view = new CrowdSim.Render.Agent(agent, Editor._agentsContainer);
    defaultGroup.addAgent(agent);
    //CrowdSim._renderOnce();
  };

  App.getStats = function() {
    var entities = App._world.entities;
    return {
      running: App._engine.running,
      iterations: App._engine.iterations,
      agents: entities.agents.length,
      groups: entities.groups.length,
      walls: entities.walls.length,
      paths: entities.paths.length,
      agent: App._world.agentSelected ? App._world.agentSelected.id : ''
    };
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
    var agents = entities.agents;
    for (var i in agents) {
      var a = agents[i];
      if (!a.extra.view) {
        new CrowdSim.Render.Agent(a, App._agentsContainer, App._agentTexture, App._debugContainer);
      }
      a.extra.view.render();
    }
    /*
    Lazy(entities.walls).each(function(a) {
        a.extra.view.render();
    });

    Lazy(entities.groups).each(function(a) {
        a.extra.view.render();
    });
    Lazy(entities.paths).each(function(a) {
        a.extra.view.render();
    });
    */

    // render the stage
    App._renderer.render(App._stage);
    if (App.running || App.refreshOnce) {
      App.refreshOnce = false;
      requestAnimationFrame(App._render);
    }

    // callback postrender
    if (App.onPostRender) {
      App.onPostRender();
    }
  };
  return App;
})();
//# sourceURL=CrowdSimApp.js
