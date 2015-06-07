/* global window,CrowdSim, define */
(function($) {
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
    select: function(e) {
      Editor.changeMode('select');
    },
    groupAdd: function(e) {
      Editor.changeMode('groupAdd');
    },
    wallAdd: function(e) {
      Editor.changeMode('wallAdd');
    },
    toggleRun: function(e) {
      var isRunning = CrowdSimApp.toggleRun();
      $(Editor.options.buttons.run).toggleClass('hide', isRunning);
      $(Editor.options.buttons.stop).toggleClass('hide', !isRunning);
    },
    run: function(e) {
      Editor.onClick.toggleRun();
    },
    stop: function(e) {
      Editor.onClick.toggleRun();
    },
    step: function(e) {
      CrowdSimApp.step();
    },
    reset: function(e) {
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

  Editor.init = function(canvasId) {
    // init stats
    var stats = new Stats();
    $(stats.domElement).css({
      'position': 'absolute',
      'left': 0,
      'top': 0
    });
    $(document.body).append(stats.domElement);
    CrowdSimApp.onPreRender = function() {
      stats.begin();
    };
    CrowdSimApp.onPreRender = function() {
      stats.end();
    };

    // init buttons
    $('button').each(function() {
      Editor.options.buttons[this.id] = this;
      $(this).click(Editor.onClick[this.id]);
    });

    // init status bar
    $('#statuses span').each(function() {
      Editor.options.statuses[this.id] = this;
    });

    var canvas = document.getElementById(canvasId);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    Editor._events(canvas);
    // init main crowd simulator app
    CrowdSimApp.init(canvas);
    Editor._updateDisplay();
  };

  Editor._events = function(canvas) {
    var $canvas = $(canvas),
      $document = $(document),
      $window = $(window);

    // document events
    $document
      .mousedown(function(event) {
        Editor.mousedownData = {
          x: event.x,
          y: event.y
        };
      }, false)
      .mouseup(function(event) {
        if (Editor.mousedownData) {
          //CrowdSimApp.pan(x, y);
          Editor.mousedownData = null;
        }
      }, false).mousemove(function(event) {
        var md = Editor.mousedownData;
        if (Editor.mousedownData) {
          var dx = event.x - md.x;
          var dy = event.y - md.y;
          md.x = event.x;
          md.y = event.y;
          CrowdSimApp.pan(dx, dy);
          return;
        }
        Editor.statusSet({
          mouse: '(' + event.x + ',' + event.y + ')'
        });
      }, false).mousewheel(function(event) {
        CrowdSimApp.zoom(1 + event.deltaY * 0.1, event.clientX, event.clientY);
      }, false);

    // window and canvas events
    $window.keydown(keydown);
    $canvas.keydown(keydown);

    function keydown(event) {
      var render = CrowdSim.Render;
      switch (event.keyCode) { // ctrlKey shiftKey
        case 32: // space
          Editor.onClick.toggleRun();
          break;
        case 65: // a
          render.Agent.detail.cycleDetail();
          break;
        case 71: // g
          render.Group.detail.cycleDetail();
          break;
        case 80: // p
          render.Path.detail.cycleDetail();
          break;
        case 87: // w
          render.Wall.detail.cycleDetail();
          break;
        case 107: // +
          CrowdSimApp.zoom(1.1);
          break;
        case 109: // -
          CrowdSimApp.zoom(0.9);
          break;
      }
    }
  };

  Editor._updateDisplay = function() {
    var setOpts = CrowdSimApp.getStats();
    Editor.statusSet(setOpts);
  };

  Editor.init('canvas');
  return Editor;
})(jQuery);

//# sourceURL=Editor.js
