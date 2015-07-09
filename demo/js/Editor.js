/* global window, CrowdSimApp, define */
(function($) {
  'use strict';

  var Editor = {};
  // helper buttons
  Editor.buttons = {};
  Editor.statuses = {};
  Editor.entityInfo = $('.entity-panel');

  // simulation status running/stop...
  Editor.engineStatus = null;
  Editor.engineStatuses = {
    run: {
      id: 'run',
      label: 'Running',
      action: CrowdSimApp.toggleRun
    },
    stop: {
      id: 'stop',
      label: 'Stopped',
      action: CrowdSimApp.toggleRun
    },
    step: {
      id: 'step',
      label: 'Step',
      action: function() {
        CrowdSimApp.step();
        return CrowdSimApp.isRunning();
      }
    }
  };

  // edition modes
  Editor.currentMode = null;
  Editor.modes = {
    select: {
      id: 'select',
      label: 'Select'
    },
    addContext: {
      id: 'addContext',
      label: 'Add Context',
      entity: CrowdSimApp.EntityTypes.Context
    },
    addGroup: {
      id: 'addGroup',
      label: 'Add Group',
      entity: CrowdSimApp.EntityTypes.Group
    },
    addPath: {
      id: 'addPath',
      label: 'Add Path',
      entity: CrowdSimApp.EntityTypes.Path
    },
    addWall: {
      id: 'addWall',
      label: 'Add Wall',
      entity: CrowdSimApp.EntityTypes.Wall
    }
  };

  Editor.modeToggle = function(mode) {
    $('.edit-modes button').removeClass('active');
    if (!mode || mode === Editor.modes.select) {
      Editor.currentMode = Editor.modes.select;
      $('.edit-modes button#' + Editor.currentMode.id).addClass('active');
      $(Editor._canvas).css('cursor', 'default');
    } else {
      // disabled all modes except current
      Editor.currentMode = mode;
      $('.edit-modes button#' + mode.id).addClass('active');
      $(Editor._canvas).css('cursor', 'crosshair');
    }
    Editor._statusBarSet({'edit-mode': Editor.currentMode.label});
  };

  Editor.engineChange = function(newStatus) {
    // toggle running/stop modes
    Editor.engineStatus = newStatus;
    var isRunning = newStatus.action(newStatus);
    $(Editor.buttons.run).toggleClass('hide', isRunning);
    $(Editor.buttons.stop).toggleClass('hide', !isRunning);
  };

  Editor.init = function(canvasId) {
    // init stats
    var stats = new Stats();
    $(stats.domElement).css({'position': 'absolute', 'right': 0, 'top': 0});
    $(document.body).append(stats.domElement);
    CrowdSimApp.onPreRender = function() {
      stats.begin();
    };
    CrowdSimApp.onPreRender = function() {
      stats.end();
    };
    CrowdSimApp.onEntitySelected = function(entity) {
      Editor._entityInfoSet(entity);
    };
    CrowdSimApp.onCreateEntity = function(entity) {
      console.log(entity);
    };
    CrowdSimApp.onDestroyEntity = function(entity) {
      console.log(entity);
    };

    // init buttons
    $('.edit-modes button').click(function(event) {
      var mode = Editor.modes[event.currentTarget.id];
      Editor.modeToggle(mode);
      event.stopPropagation();
      return false;
    });

    Editor.buttons.run = $('.engine-status button#run').first();
    Editor.buttons.stop = $('.engine-status button#stop').first();
    $('.engine-status button').click(function(event) {
      var status = Editor.engineStatuses[event.currentTarget.id];
      Editor.engineChange(status);
      event.stopPropagation();
      return false;
    });

    // init status bar
    $('#statuses span').each(function() {
      Editor.statuses[this.id] = this;
    });

    // init canvas
    Editor._canvas = document.getElementById(canvasId);
    Editor._canvas.width = window.innerWidth;
    Editor._canvas.height = window.innerHeight;

    Editor._events(Editor._canvas);
    // init main crowd simulator app
    CrowdSimApp.init(Editor._canvas);
    Editor._updateDisplay();
  };

  Editor._entityInfoSet = function(renderEntity) {
    var entity = renderEntity.entityModel;
    $('.entity-type',Editor.entityInfo).html(entity.constructor.type);
    $('.entity-id',Editor.entityInfo).html(entity.id);

    function numberHelper(control, pos, i) {
      $(control).val(pos[i].toFixed(2)).off('change').change(function(e) {
        if (!isNaN(Number($(this).val()))) {
          pos[i] = Number($(this).val());
        }
      });
    }
    numberHelper($('.entity-x',Editor.entityInfo),entity.pos,0);
    numberHelper($('.entity-y',Editor.entityInfo),entity.pos,1);
    var control = $('.entity-props',Editor.entityInfo);
    control.empty();
    $.each(entity.options, function(p, v) {
      var newControl = $('<div>' + p + ': </div>');
      var newInput = $('<input type="text" class="entity entity-' + p + '">').appendTo(newControl);
      newInput.val(v);
      control.append(newControl);
      numberHelper(newInput,entity.options,p);
    });
  };

  Editor._events = function(canvas) {
    var $canvas = $(canvas),
        $document = $(document),
        $window = $(window);

    // document events
    $window.mousedown(mousedown)
            .mouseup(mouseup)
            .mousemove(mousemove)
            .mousewheel(mousewheel);

    // window and canvas events
    $window.keydown(keydown);
    $window.keyup(keyup);

    var entityCreated;
    var panningEvent;
    function mousedown(event) {
      var pos = CrowdSimApp.screenToWorld(event.clientX, event.clientY);
      CrowdSimApp.mousedown(event);
      switch (event.button){
        case 0: // left button
          // add entities mode
          if (Editor.currentMode && Editor.currentMode.entity) {
            if (entityCreated) { // continue creating current entity

            } else { // starts creating
              entityCreated = CrowdSimApp.startCreateEntity(Editor.currentMode.entity, pos);
            }
          }
        break;
        case 1: // middle button for panning
          panningEvent = event;
          $canvas.css('cursor', 'pointer');
        break;
        case 2: // left button
          return false;
      }
    }

    function mousemove(event) {
      CrowdSimApp.mousemove(event);
      if (panningEvent) {
        CrowdSimApp.pan(event.clientX - panningEvent.clientX, event.clientY - panningEvent.clientY);
        panningEvent = event;
        return;
      }
      if (entityCreated) {

      }
      var pos = CrowdSimApp.screenToWorld(event.clientX, event.clientY);
      Editor._statusBarSet({mouse: '(' + pos.x.toFixed(2) + ',' + pos.y.toFixed(2) + ')'});
    }

    function mouseup(event) {
      var pos = {x: event.clientX, y: event.clientY};
      CrowdSimApp.mouseup(event);
      switch (event.button){
        case 0: // left button
        break;
        case 1:// middle button for panning
          if (event.button === 1) {
            $canvas.css('cursor', 'default');
            panningEvent = null;
          }
        break;
        case 2:// right button
          if (entityCreated) { // ends creating action
            entityCreated = CrowdSimApp.endCreateEntity();
          }
          return false;
      }
    }

    function mousewheel(event) {
      if (event.deltaY > 0) {
        $canvas.css('cursor', 'zoom-in');
      } else {
        $canvas.css('cursor', 'zoom-out');
      }
      CrowdSimApp.zoom(event.deltaY, event.clientX, event.clientY);
      $canvas.delay(250).queue(function(next) {
        $(this).css('cursor', 'default');
        next();
      });
    }

    function keydown(event) {
      console.log(event);
      var render = CrowdSim.Render;
      switch (event.keyCode) { // ctrlKey shiftKey
      case 17: // ctrl
        CrowdSimApp.snapToGrid = false;
      break;
      case 27: // escape
        // cancels mode creation
        CrowdSimApp.endCreateEntity();
        Editor.modeToggle();
        entityCreated = null;
      break;
      case 32: // space
        Editor.engineChange(Editor.engineStatuses.run);
      break;
      case 65: // a
        CrowdSimApp.cycleDetail(CrowdSimApp.EntityTypes.Agent);
      break;
      case 71: // g
        CrowdSimApp.cycleDetail(CrowdSimApp.EntityTypes.Group);
      break;
      case 80: // p
        CrowdSimApp.cycleDetail(CrowdSimApp.EntityTypes.Path);
      break;
      case 87: // w
        CrowdSimApp.cycleDetail(CrowdSimApp.EntityTypes.Wall);
      break;
      case 107: // +
        CrowdSimApp.zoom(1.1);
      break;
      case 109: // -
        CrowdSimApp.zoom(0.9);
      break;
      }
    }

    function keyup(event) {
      switch (event.keyCode) {
      case 17: // ctrl
        CrowdSimApp.snapToGrid = true;
      break;
      }
    }
  };

  // Set text in the status bar
  Editor._statusBarSet = function(values) {
    for (var i in values) {
      if (!Editor.statuses[i]) {
        console.log('Status display not defined: ' + i);
      } else {
        $(Editor.statuses[i]).html(values[i]);
      }
    }
  };

  Editor._updateDisplay = function() {
    var setOpts = CrowdSimApp.getStats();
    Editor._statusBarSet(setOpts);
  };

  Editor.init('canvas');
  return Editor;
})(jQuery);

//# sourceURL=Editor.js
