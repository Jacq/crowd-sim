'use strict';

/* global window,CrowdSim, define */

var Demo = {};
Demo.options = {
  buttons: {},
  statuses: {},
  interactive: true
};

Demo.modes = {
  select: {
    id: 'select',
    label: 'Select'
  },
  groupAdd: {
    id: 'groupAdd',
    label: 'Add Group'
  },
  wallAdd: {
    id: 'wallAdd',
    label: 'Add Wall'
  },
};

Demo.assets = ['img/swvclt.json'];

Demo.onClick = {
  select: function() {
    Demo.changeMode('select');
  },
  groupAdd: function() {
    Demo.changeMode('groupAdd');
  },
  wallAdd: function() {
    Demo.changeMode('wallAdd');
  },
  start: function() {
    Demo._engine.run();
    requestAnimationFrame(Demo._render);
    console.log('running');
    Demo.running = true;
  },
  stop: function() {
    Demo._engine.stop();
    console.log('stopped');
    Demo.running = false;
  },
  step: function() {
    Demo._engine.step();
    requestAnimationFrame(Demo._render);
  },
  reset: function() {
    Demo._engine.reset();
    console.log('reset');
    Demo._initRender();
  }
};

Demo.statusSet = function(values) {
  for (var i in values) {
    if (!Demo.options.statuses[i]) {
      console.log('Status display not defined: ' + i);
    }
    Demo.options.statuses[i].innerHTML = values[i];
  }
};

Demo.changeMode = function(newMode) {
  Demo.mode = Demo.modes[newMode];
  Demo.statusSet({
    'edit-mode': Demo.mode.label
  });
};

Demo.init = function() {
  // init stats
  var stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);
  Demo.stats = stats;

  // init buttons
  var buttons = document.getElementsByTagName('button');
  for (var i = 0; i < buttons.length; i++) {
    var btn = buttons[i];
    Demo.options.buttons[btn.id] = btn;
    btn.addEventListener('click', Demo.onClick[btn.id]);
  }
  // init status bar
  var statuses = document.getElementById('statuses').getElementsByTagName('span');
  for (var j = 0; j < statuses.length; j++) {
    var st = statuses[j];
    Demo.options.statuses[st.id] = st;
  }

  var canvas = document.getElementById('canvas');
  var w = canvas.width = window.innerWidth;
  var h = canvas.height = window.innerHeight;

  // create a renderer instance.
  var renderer = PIXI.autoDetectRenderer(w, h);

  // add the renderer view element to the DOM
  canvas.appendChild(renderer.view);

  // create root container
  var stage = new PIXI.Container();
  stage.scale.x = 10;
  stage.scale.y = 10;
  // create agents container
  var worldContainer = new PIXI.Container();
  var agentsContainer = new PIXI.ParticleContainer(1000, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });
  var debugContainer = new PIXI.Container();
  stage.addChild(agentsContainer);
  stage.addChild(worldContainer);
  stage.addChild(debugContainer);
  if (Demo.options.interactive) {
    Demo._events(stage, canvas);
  }

  Demo._world = new CrowdSim.World(w, h);
  Demo._renderer = renderer;
  Demo._stage = stage;
  Demo._agentsContainer = agentsContainer;
  Demo._worldContainer = worldContainer;
  Demo._debugContainer = debugContainer;
  Demo._engine = new CrowdSim.Engine(Demo._world, {
    timeStepSize: 0.1, // time per step
    timeStepRun: 0.01, // time between step runnings
    onStep: null
  });
  var size = 20;
  var door = size / 8;
  var cx = 40, cy = 40;
  var gx = 41, gy = 41;
  var path = new CrowdSim.Path([[10, 10], [20, 21], [31, 30], [41, 41], [41, 75], [55, 80], [65, 70], [65, 60]]);
  var group = new CrowdSim.Group(2 , Demo._world, [[gx, gy], [gx + size / 2, gy + size / 2]]);
  group.assignPath(path);
  var room1 = [[cx + size / 2 - door, cy + size], [cx, cy + size], [cx, cy], [cx + size, cy], [cx + size, cy + size], [cx + size / 2 + door, cy + size]];
  var room2 = [[cx + size / 2 - door, cy + size], [cx, cy + size]];
  //var wall = new CrowdSim.Wall(room);
  var wall = new CrowdSim.Wall(room1);
  Demo._world.addGroup(group);
  Demo._world.addWall(wall);
  Demo._world.addPath(path);

  function fullscreen() {
    var el = document.getElementById('canvas');

    if (el.webkitRequestFullScreen) {
      el.webkitRequestFullScreen();
    } else {
      el.mozRequestFullScreen();
    }
  }

  //var loader = new PIXI.AssetLoader(Demo.assets);
  Demo._initRender(Demo._world);
};

Demo._events = function(stage, canvas) {
  stage.mouseover = function(mouseData) {
    //console.log('MOUSE OVER!');
  };

  stage.mouseout = function(mouseData) {
    //console.log('MOUSE OUT!');
  };

  stage.mousedown = stage.touchstart = function(mouseData) {
    switch (Demo.mode) {
      case Demo.modes.select:
        break;
      case Demo.modes.groupAdd:
        break;
      case Demo.modes.wallAdd:
        break;
    }
  };

  stage.mouseup = stage.mouseupoutside = stage.touchend = function(mouseData) {
    //console.log('MOUSE UP!');
  };

  stage.click = function(mouseData) {
    //console.log('CLICK!');
    var defaultGroup = Demo._world.getDefaultGroup();
    var global = mouseData.global;
    var agent = new CrowdSim.Agent(global.x, global.y, 5);
    agent.extra.view = new CrowdSim.Render.Agent(agent, Demo._agentsContainer);
    defaultGroup.addAgent(agent);
    Demo._renderOnce();
  };

  stage.tap = function(touchData) {
    //console.log('TAP!');
  };

  stage.mousemove = stage.touchmove = function(mouseMove) {
    //console.log('Move!');
    //console.log(mouseMove.global);
    var optSet = {
      mouse: '(' + mouseMove.global.x + ',' + mouseMove.global.y + ')'
    };
    Demo.statusSet(optSet);
  };

  window.addEventListener('keydown', keydown);
  canvas.addEventListener('keydown', keydown);
  function keydown(event) {
    var render = CrowdSim.Render;
    switch (event.keyCode) { // ctrlKey shiftKey
      case 65: // a
        if (event.ctrlKey) {
          render.Agent.show.body = !render.Agent.show.body;
        }else if (event.shiftKey) {
          render.Agent.show.direction = !render.Agent.show.direction;
        }else {
          render.Agent.show.all = !render.Agent.show.all;
        }
        break;
      case 71: // g
        if (event.ctrlKey) {
          render.Group.show.area = !render.Group.show.area;
        }else if (event.shiftKey) {
          render.Group.show.joints = !render.Group.show.joints;
        }else {
          render.Group.show.all = !render.Group.show.all;
        }
        break;
      case 87: // w
        if (event.ctrlKey) {
          render.Wall.show.path = !render.Wall.show.path;
        }else if (event.shiftKey) {
          render.Wall.show.corners = !render.Wall.show.corners;
        }else {
          render.Wall.show.all = !render.Wall.show.all;
        }
        break;
      case 107: // w
        Demo._stage.scale.x *= 1.1;
        Demo._stage.scale.y *= 1.1;
        break;
      case 109: // w
        Demo._stage.scale.x *= 0.9;
        Demo._stage.scale.y *= 0.9;
        break;
    }
  }

};

Demo._updateDisplay = function() {
  var entities = Demo._world.entities;
  var setOpts = {
    running: Demo._engine.running,
    iterations: Demo._engine.iterations,
    children: entities.agents.length,
    agent: Demo._world.agentSelected ? Demo._world.agentSelected.id : ''
  };

  Demo.statusSet(setOpts);
};

Demo._initRender = function() {
  var baseTextures = PIXI.Texture.fromImage('img/flt.png');
  var agentTexture = new PIXI.Texture(baseTextures, new PIXI.Rectangle(26, 16, 51, 36));

  Demo.running = false;
  Demo._worldContainer.removeChildren();
  Demo._agentsContainer.removeChildren();
  var entities = Demo._world.entities;
  Lazy(entities.agents).each(function(a) {
    new CrowdSim.Render.Agent(a, Demo._agentsContainer, agentTexture, Demo._debugContainer);
  });
  Lazy(entities.walls).each(function(a) {
    new CrowdSim.Render.Wall(a, Demo._worldContainer);
  });
  Lazy(entities.groups).each(function(a) {
    new CrowdSim.Render.Group(a, Demo._worldContainer);
  });
  Lazy(entities.paths).each(function(a) {
    new CrowdSim.Render.Path(a, Demo._worldContainer);
  });

  Demo._updateDisplay();
  Demo._renderOnce(); // to draw everything
  // canvas.addEventListener('click', fullscreen);
  //requestAnimFrame(Demo._render);
};

Demo._renderOnce = function() {
  Demo.refreshOnce = true;
  requestAnimationFrame(Demo._render);
};

Demo._render = function() {
  Demo.stats.begin();
  var entities = Demo._world.entities;
  var agents = entities.agents;
  for (var i in agents) {
    agents[i].extra.view.render();
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
  Demo._renderer.render(Demo._stage);
  if (Demo.running || Demo.refreshOnce) {
    Demo.refreshOnce = false;
    requestAnimationFrame(Demo._render);
  }
  Demo._updateDisplay();
  Demo.stats.end();
};

Demo.init();
Demo.onClick.start();

//# sourceURL=Demo.js
