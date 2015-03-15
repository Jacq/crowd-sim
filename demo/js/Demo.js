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
    window.requestAnimFrame(Demo._animate);
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
    window.requestAnimFrame(Demo._animate);
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

  // create an new instance of a pixi stage
  var stage = new PIXI.Stage(0x000000, Demo.options.interactive);
  if (Demo.options.interactive) {
    Demo._events(stage);
  }
  // create a renderer instance.
  var renderer = PIXI.autoDetectRenderer(w, h, canvas);
  // add the renderer view element to the DOM
  canvas.appendChild(renderer.view);

  Demo._world = new CrowdSim.World(w, h);
  Demo._renderer = renderer;
  Demo._stage = stage;
  Demo._engine = new CrowdSim.Engine(Demo._world, {
    onStep: Demo._updateDisplay
  });
  var size = 300;
  var door = 50;
  var cx = w / 3, cy =  h / 3;
  var groupOpts = {overlap: false, size: 4, waypoints: [[100,100], [200,210], [310,300], [410,410]]};
  group = new CrowdSim.Group(100, [[cx, cy], [cx + size / 2, cy + size / 2]], groupOpts);
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

  Demo._initRender(Demo._world);
};

Demo._events = function(stage) {
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
    var agent = new CrowdSim.Agent(Demo._world.groups.length, global.x, global.y, 5, 0);
    agent.extra.view = new CrowdSim.Render.Agent(agent, Demo._stage);
    defaultGroup.addAgent(agent);
    Demo._animateOnce();
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

};

Demo._updateDisplay = function() {
  var setOpts = {
    running: Demo._engine.running,
    iterations: Demo._engine.iterations,
    children: Demo._world.groups.length,
    agent: Demo._world.agentSelected ? Demo._world.agentSelected.id : ''
  };

  Demo.statusSet(setOpts);
};

Demo._initRender = function() {
  Demo.running = false;
  Demo._stage.removeChildren();
  var agents = Demo._world.getAgents();
  agents.each(function(a) {
    new CrowdSim.Render.Agent(a, Demo._stage);
  });
  var walls = Demo._world.getWalls();
  walls.each(function(a) {
    new CrowdSim.Render.Wall(a, Demo._stage);
  });
  var groups = Demo._world.getGroups();
  groups.each(function(a) {
    new CrowdSim.Render.Group(a, Demo._stage);
  });

  Demo._updateDisplay();
  Demo._animateOnce(); // to draw everything

  // canvas.addEventListener('click', fullscreen);
  //window.requestAnimFrame(Demo._animate);
};

Demo._animateOnce = function() {
  Demo.refreshOnce = true;
  window.requestAnimFrame(Demo._animate);
};

Demo._animate = function() {
  Demo._renderer.render(Demo._stage);
  Demo._world.getAgents().each(function(a) {
    a.extra.view.render();
  });

  Demo._world.getWalls().each(function(a) {
    a.extra.view.render();
  });

  Demo._world.getGroups().each(function(a) {
    a.extra.view.render();
  });

  if (Demo.running || Demo.refreshOnce) {
    Demo.refreshOnce = false;
    window.requestAnimFrame(Demo._animate);
  }
  // single.render.;
  // render the stage
};

Demo.init();
