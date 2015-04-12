var Demo = {};
Demo.options = {
  buttons: {},
  statuses: {},
  interactive: true
};

Demo.modes = {
  select: {
    id: select,
    label: 'Select'
  },
  groupAdd: {
    id: groupAdd,
    label: 'Add Group'
  },
  wallAdd: {
    id: wallAdd,
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
  // create agents container
  var worldContainer = new PIXI.Container();
  var agentsContainer = new PIXI.ParticleContainer(100000, {
    scale: true,
    position: true,
    rotation: true,
    uvs: true,
    alpha: true
  });
  stage.addChild(agentsContainer);
  stage.addChild(worldContainer);
  if (Demo.options.interactive) {
    Demo._events(stage, canvas);
  }

  Demo._world = new CrowdSim.World(w, h);
  Demo._renderer = renderer;
  Demo._stage = stage;
  Demo._agentsContainer = agentsContainer;
  Demo._worldContainer = worldContainer;
  Demo._engine = new CrowdSim.Engine(Demo._world, {
    onStep: null
  });
  var size = 300;
  var door = 50;
  var cx = w / 3, cy =  h / 3;
  var groupOpts = {overlap: false, size: 10, waypoints: [[100, 100], [200, 210], [310, 300], [410, 410]]};
  group = new CrowdSim.Group(Demo._world,100, [[cx, cy], [cx + size / 2, cy + size / 2]], groupOpts);
  var room = [[cx + size / 2 - door, cy + size], [cx, cy + size], [cx, cy], [cx + size, cy], [cx + size, cy + size], [cx + size / 2 + door, cy + size]];
  wall = new CrowdSim.Wall(room);
  Demo._world.addGroup(group);
  Demo._world.addWall(wall);

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
          render.Group.show.waypoints = !render.Group.show.waypoints;
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
    new CrowdSim.Render.AgentSprite(a, Demo._agentsContainer, agentTexture);
  });
  Lazy(entities.walls).each(function(a) {
    new CrowdSim.Render.Wall(a, Demo._worldContainer);
  });
  Lazy(entities.groups).each(function(a) {
    new CrowdSim.Render.Group(a, Demo._worldContainer);
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
    agents[i].extra.view.update();
  }
  /*
  Lazy(entities.walls).each(function(a) {
      a.extra.view.update();
  });

  Lazy(entities.groups).each(function(a) {
      a.extra.view.update();
  });*/

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
