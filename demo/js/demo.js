var Demo = {};

(function() {
  'use strict';

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

    var world = new CrowdSim.World(w, h);
    for (var i = 0; i < 10; i++) {
      var x = Math.random() * w;
      var y = Math.random() * h;

      var entity = new CrowdSim.Entity(i, x, y, 5, 0);
      world.add(entity);
    }

    function fullscreen() {
      var el = document.getElementById('canvas');

      if (el.webkitRequestFullScreen) {
        el.webkitRequestFullScreen();
      } else {
        el.mozRequestFullScreen();
      }
    }

    Demo._renderer = renderer;
    Demo._stage = stage;

    var options = {
      onStep: Demo._updateDisplay
    };
    CrowdSim.Engine.init(world, options);
    Demo._initRender(world);
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
      var world = CrowdSim.Engine.getWorld();
      var entity = new CrowdSim.Entity(world.entities.length, global.x, global.y, 5, 0);
      entity.view = new Render.Entity(entity, Demo._stage);
      world.add(entity);
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
    var engine = CrowdSim.Engine;
    var world = engine.getWorld();
    var display = Demo.options.display;
    display.running.innerHTML = engine.running;
    display.iterations.innerHTML = engine.iterations;
    display.children.innerHTML = world.entities.length;
    display.entity.innerHTML = world.entitySelected ? world.entitySelected.id : '';
  };

  Demo._initRender = function() {
    Demo.running = false;
    var world = CrowdSim.Engine.world;
    Demo._stage.removeChildren();
    for (var j in world.entities) {
      var entity = world.entities[j];
      entity.view = new Render.Entity(entity, Demo._stage);
    }

    Demo._updateDisplay(CrowdSim.Engine);
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
    var world = CrowdSim.Engine.world;
    for (var i in world.entities) {
      var entity = world.entities[i];
      entity.view.render();
    }

    if (Demo.running || Demo.refreshOnce) {
      Demo.refreshOnce = false;
      window.requestAnimFrame(Demo._animate);
    }
    // single.render.;
    // render the stage
  };

  Demo.Start = function() {
    CrowdSim.Engine.run();
    window.requestAnimFrame(Demo._animate);
    console.log('running');
    Demo.running = true;
  };

  Demo.Stop = function() {
    CrowdSim.Engine.stop();
    console.log('stopped');
    Demo.running = false;
  };
  Demo.Step = function() {
    CrowdSim.Engine.step();
    window.requestAnimFrame(Demo._animate);
  };

  Demo.Reset = function() {
    CrowdSim.Engine.reset();
    console.log('reset');
    Demo._initRender();
  };

  Demo.ToggleDisplay = function() {
    var classNames = display.console.className.split(' ');
    var hideIndex = classNames.indexOf('consoleHide');
    var showIndex = classNames.indexOf('consoleShow');
    if (hideIndex !== -1) {
      delete classNames[hideIndex];
      classNames[hideIndex] = 'consoleShow';
    } else if (showIndex !== -1) {
      delete classNames[showIndex];
      classNames[showIndex] = 'consoleHide';
    }
    display.console.className = classNames.join(' ');
  };

  /* var demo = new Demo();
  window.Demo = demo;*/
})();

Demo.init();
