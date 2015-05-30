/* global window,CrowdSim, define */
(function() {
  'use strict';

  var Editor = {};
  Editor.options = {
    buttons: {},
    statuses: {}
  };

  Editor.modes = {
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

  Editor.onClick = {
    select: function() {
      Editor.changeMode('select');
    },
    groupAdd: function() {
      Editor.changeMode('groupAdd');
    },
    wallAdd: function() {
      Editor.changeMode('wallAdd');
    },
    start: function() {
      CrowdSimApp.run();
    },
    stop: function() {
      CrowdSimApp.stop();
    },
    step: function() {
      CrowdSimApp.step();
    },
    reset: function() {
      CrowdSimApp.reset();
    }
  };

  Editor.statusSet = function(values) {
    for (var i in values) {
      if (!Editor.options.statuses[i]) {
        console.log('Status display not defined: ' + i);
      } else {
        Editor.options.statuses[i].innerHTML = values[i];
      }
    }
  };

  Editor.changeMode = function(newMode) {
    Editor.mode = Editor.modes[newMode];
    Editor.statusSet({
      'edit-mode': Editor.mode.label
    });
  };

  Editor.init = function() {
    // init stats
    var stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);
    CrowdSimApp.onPreRender = function() {
      stats.begin();
    };
    CrowdSimApp.onPreRender = function() {
      stats.end();
    };

    // init buttons
    var buttons = document.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      Editor.options.buttons[btn.id] = btn;
      btn.addEventListener('click', Editor.onClick[btn.id]);
    }
    // init status bar
    var statuses = document.getElementById('statuses').getElementsByTagName('span');
    for (var j = 0; j < statuses.length; j++) {
      var st = statuses[j];
      Editor.options.statuses[st.id] = st;
    }

    var canvas = document.getElementById('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    document.addEventListener('mousedown', function(event) {
      Editor.mousedownData = {x: event.x, y: event.y};
    },false);

    document.addEventListener('mouseup', function(event) {
      if (Editor.mousedownData) {
        //CrowdSimApp.pan(x, y);
        Editor.mousedownData = null;
      }
    },false);

    document.addEventListener('mousemove', function(event) {
      var md = Editor.mousedownData;
      if (Editor.mousedownData) {
        var dx = event.x - md.x;
        var dy = event.y - md.y;
        md.x = event.x;
        md.y = event.y;
        CrowdSimApp.pan(dx, dy);
        return;
      }
      Editor.statusSet({mouse: '(' + event.x + ',' + event.y + ')'});
    }, false);

    document.addEventListener('mousewheel', function(event) {
      CrowdSimApp.zoom(1 - Math.sign(event.deltaY) * 0.1, event.x, event.y);
    }, false);

    window.addEventListener('keydown', keydown);
    canvas.addEventListener('keydown', keydown);
    function keydown(event) {
      var render = CrowdSim.Render;
      switch (event.keyCode) { // ctrlKey shiftKey
        case 32: // a
          CrowdSimApp.run();
          break;
        case 65: // a
          render.Agent.detail.cycleDetail();
          break;
        case 71: // g
          render.Group.detail.cycleDetail();
          break;
        case 80: // w
          render.Path.detail.cycleDetail();
          break;
        case 87: // w
          render.Wall.detail.cycleDetail();
          break;
        case 107: // w
          CrowdSimApp.zoom(1.1);
          break;
        case 109: // w
          CrowdSimApp.zoom(0.9);
          break;
      }
    }

    // init main crowd simulator app
    CrowdSimApp.init(canvas);
    Editor._updateDisplay();
  };

  Editor._events = function(stage, canvas) {
    document.addEventListener('mousewheel', function(event) {
      Editor.zoom(1 - Math.sign(event.deltaY) * 0.1, event.x, event.y);
    }, false);

    stage.mousedown = function(mouseData) {
      switch (Editor.mode) {
        case Editor.modes.select:
          break;
        case Editor.modes.groupAdd:
          break;
        case Editor.modes.wallAdd:
          break;
      }
      Editor.mousedown = {x: mouseData.data.global.x, y: mouseData.data.global.y};
    };

    stage.mouseup = function(mouseData) {
      var x = mouseData.data.global.x;
      var y = mouseData.data.global.y;
      CrowdSimApp.addSingleAgent(x, y);
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
          CrowdSimApp.zoom(1.1);
          break;
        case 109: // w
          CrowdSimApp.zoom(0.9);
          break;
      }
    }

  };

  Editor._updateDisplay = function() {
    var setOpts = CrowdSimApp.getStats();
    Editor.statusSet(setOpts);
  };

  Editor.init();
  return Editor;
})();

//# sourceURL=Editor.js
