
var AgentRender = require('./AgentRender');

var Demo = {};
Demo.options = {
  display: {
    running: document.getElementById('runnning'),
    mouse: document.getElementById('mouse'),
    iterations: document.getElementById('iterations'),
    console: document.getElementById('console'),
    children: document.getElementById('children'),
    entity: document.getElementById('entity')
  },
  interactive: true
};

Demo.init = function() {
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
  var options = {
    onStep: Demo._updateDisplay
  };

  Demo._engine = new CrowdSim.Engine(Demo._world, options);
  group = new CrowdSim.Group(10,[0,0,w,h]);
  Demo._world.add(group);

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
    //console.log('MOUSE DOWN!');
  };

  stage.mouseup = stage.mouseupoutside = stage.touchend = function(mouseData) {
    //console.log('MOUSE UP!');
  };

  stage.click = function(mouseData) {
    //console.log('CLICK!');
    var global = mouseData.global;
    var agent = new CrowdSim.Agent(Demo._world.entities.length, global.x, global.y, 5, 0);
    agent.extra.view = new AgentRender(agent, Demo._stage);
    Demo._world.add(agent);
    Demo._animateOnce();
  };

  stage.tap = function(touchData) {
    //console.log('TAP!');
  };

  stage.mousemove = stage.touchmove = function(mouseMove) {
    //console.log('Move!');
    //console.log(mouseMove.global);
    Demo.options.display.mouse.innerHTML = '(' + mouseMove.global.x + ',' + mouseMove.global.y + ')';
  };

};

Demo._updateDisplay = function() {
  var display = Demo.options.display;
  display.running.innerHTML = Demo._engine.running;
  display.iterations.innerHTML = Demo._engine.iterations;
  display.children.innerHTML = Demo._world.entities.length;
  display.agent.innerHTML = Demo._world.agentSelected ? Demo._world.agentSelected.id : '';
};

Demo._initRender = function() {
  Demo.running = false;
  Demo._stage.removeChildren();
  for (var j in Demo._world.agents) {
    var agent = Demo._world.agents[j];
    agent.extra.view = new AgentRender.Agent(agent, Demo._stage);
  }

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
  for (var i in Demo._world.entities) {
    var entity = Demo._world.entities[i];
    entity.extra.view.render();
  }

  if (Demo.running || Demo.refreshOnce) {
    Demo.refreshOnce = false;
    window.requestAnimFrame(Demo._animate);
  }
  // single.render.;
  // render the stage
};

Demo.Start = function() {
  Demo._engine.run();
  window.requestAnimFrame(Demo._animate);
  console.log('running');
  Demo.running = true;
};

Demo.Stop = function() {
  Demo._engine.stop();
  console.log('stopped');
  Demo.running = false;
};
Demo.Step = function() {
  Demo._engine.step();
  window.requestAnimFrame(Demo._animate);
};

Demo.Reset = function() {
  Demo._engine.reset();
  console.log('reset');
  Demo._initRender();
};

module.exports = Demo;
