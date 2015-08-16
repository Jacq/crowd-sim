/* global window, CrowdSimApp, define */
var CrowdSimEditor = (function($) {
  'use strict';

  var Editor = {};
  // helper buttons
  Editor.buttons = {};
  Editor.statuses = {};
  Editor.entityInfo = $('.entity-panel .properties');
  Editor.engineSettings = $('.entity-panel .engine');

  // stores the current entity being created
  Editor._entityCreated = null;

  // simulation status running/stop...
  Editor.engineStatus = null;
  Editor.engineTimerId = null;
  Editor.engineStatusChange = function(isRunning) {
    if (isRunning) {
      Editor.engineTimerId = setInterval(Editor._updateDisplay, 1000);
    } else {
      clearInterval(Editor.engineTimerId);
    }
    Editor._statusBarSetOne('running', isRunning);
    return isRunning;
  };

  Editor.engineStatuses = {
    run: {
      id: 'run',
      label: 'Running',
      action: function() { return Editor.engineStatusChange(CrowdSimApp.toggleRun()); }
    },
    stop: {
      id: 'stop',
      label: 'Stopped',
      action: function() { return Editor.engineStatusChange(CrowdSimApp.toggleRun()); }
    },
    step: {
      id: 'step',
      label: 'Step',
      action: function() { return Editor.engineStatusChange(CrowdSimApp.step()); }
    },
    reset: {
      id: 'reset',
      label: 'Reset',
      action: function() { return Editor.engineStatusChange(CrowdSimApp.reset()); }
    }
  };

  // edition modes
  Editor.currentMode = null;
  Editor.modes = {
    select: {
      id: 'select',
      label: 'Select',
      message: 'Click on entities to drag and browse their properties',
      cursor: 'default'
    },
    edit: {
      id: 'edit',
      label: 'Edit',
      message: 'Click on entity to modify it',
      cursor: 'pointer'
    },
    remove: {
      id: 'remove',
      label: 'Remove',
      message: 'Click on entities remove them',
      cursor: 'pointer'
    },
    addContext: {
      id: 'addContext',
      label: 'Add Context',
      entity: CrowdSimApp.EntityTypes.Context,
      message: 'Click to add a Context',
      cursor: 'crosshair'
    },
    addGroup: {
      id: 'addGroup',
      label: 'Add Group',
      entity: CrowdSimApp.EntityTypes.Group,
      message: 'Click to add a Group',
      cursor: 'crosshair'
    },
    addPath: {
      id: 'addPath',
      label: 'Add Path',
      entity: CrowdSimApp.EntityTypes.Path,
      message: 'Click to add a Path',
      cursor: 'crosshair'
    },
    addWall: {
      id: 'addWall',
      label: 'Add Wall',
      entity: CrowdSimApp.EntityTypes.Wall,
      message: 'Click to add a Wall',
      cursor: 'crosshair'
    }
  };

  Editor._helpers = {
    // handles setting and editing properties with a input control
    createBooleanInput: function(control, prop, i) {
      $(control).prop('checked', prop[i]).off('change').change(function(e) {
        var that = $(this);
        prop[i] = $(this).is(':checked');
        that.addClass('highlight');
        setTimeout(function() {
          that.removeClass('highlight');
        }, 500);
      });
    },
    createNumberInput: function(control, prop, i) {
      $(control).val(prop[i].toFixed ? prop[i].toFixed(3) : prop[i]).off('change').change(function(e) {
        var that = $(this);
        var value = Number(that.val()); // try convert to number
        prop[i] = value.toFixed ? value : that.val();
        that.addClass('highlight');
        setTimeout(function() {
          that.removeClass('highlight');
        }, 500);
      });
    },
    // create inputs for editing properties in a object
    createInputsRecursive: function(control, entityProp) {
      $.each(entityProp, function(p, v) {
        var newControl = $('<div>' + p + ': </div>');
        if (Array.isArray(entityProp[p])) { // if property is array recursive create its on inputs
          Editor._helpers.createInputsRecursive(newControl, entityProp[p]);
          control.append(newControl);
        } else {
          var newInput = null;
          if (typeof entityProp[p] === 'boolean') {
            newInput = $('<input type="checkbox" class="entity entity-' + p + '">');
            Editor._helpers.createBooleanInput(newInput, entityProp, p);
          } else {
            newInput = $('<input type="text" class="entity entity-' + p + '">');
            Editor._helpers.createNumberInput(newInput, entityProp, p);
          }
          newInput.val(v);
          newInput.appendTo(newControl);
          control.append(newControl);
        }
      });
    },
    // create inputs for editing properties in a object
    createEntityLabel: function(control, entityProp) {
      $.each(entityProp, function(k, v) {
        var value = null;
        if (v) { // if assigned entity
          value = v.id || '';
          if (Array.isArray(v)) {
            for (var i in v) {
              value += v[i].id + ', ';
            }
          }
        }
        var newControl = $('<div>' + k + ': ' + value + '</div>');
        control.append(newControl);

      });
    },
    toggleFullScreen: function() {
      var doc = window.document;
      var docEl = doc.documentElement;

      var requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
      var cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen || doc.webkitExitFullscreen || doc.msExitFullscreen;

      if (!doc.fullscreenElement && !doc.mozFullScreenElement && !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
        requestFullScreen.call(docEl);
      } else {
        cancelFullScreen.call(doc);
      }
    }
  };

  Editor.init = function(canvasId) {
    // init stats
    var stats = new Stats();
    $(stats.domElement).css({
      'position': 'absolute',
      'right': 0,
      'top': 0
    });
    $(document.body).append(stats.domElement);
    // wire Crowdsim callbacks
    // Stats rendering
    var entityList = $('.entity-list-container');
    // init toolbar buttons
    $('.edit-modes button').click(function(event) {
      var mode = Editor.modes[event.currentTarget.id];
      Editor.modeToggle(mode);
      if (Editor._entityCreated) {
        // stops creating current entity
        Editor._entityCreated = CrowdSimApp.createEntityEnd();
      }
      event.stopPropagation();
      return false;
    });
    // init default select mode
    Editor.modeToggle();

    // manage simulation status
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

    // wire mouse and keyboard events
    Editor._events(Editor._canvas);

    // CrowdSimApp options
    var appOptions = {
      debug: true,
      width: window.innerWidth,
      height: window.innerHeight,
      callbacks: {
        onPreRender: function() { stats.begin(); },
        onPostRender: function() { stats.end(); },
        onEntitySelected: function(entity) {
          switch (Editor.currentMode) {
            case Editor.modes.select:
              Editor._entityInfoSet(entity);
            break;
            case Editor.modes.edit:
              CrowdSimApp.editEntity(entity);
            break;
            case Editor.modes.remove:
              CrowdSimApp.destroyEntity(entity);
            break;
          }
        },
        onCreateEntity: function(renderEntity) { // Manages add/editing/remove of entities
          var entity = renderEntity.entityModel;
          var type = entity.constructor.type;
          // Append to Entities list html
          var listToAppend = $('ul.entity-' + type, entityList);
          var line = $('<li id="entitiy-id-' + entity.id + '" class="entity-' + type + ' bgcolor-' + type + '">' + entity.id + '</li>');
          line.click(function() {
            CrowdSimApp.selectEntityById(entity.id);
          });
          line.appendTo(listToAppend);
        },
        onDestroyEntity: function(entity) {
          $('#entitiy-id-' + entity.id, entityList).off('click').remove();
        },
        onLoad: function(world) {

        },
        onSave: function(world) {
        }
      }
    };

    // init main crowd simulator app
    CrowdSimApp.init(Editor._canvas, appOptions);
    Editor._helpers.createInputsRecursive(Editor.engineSettings, CrowdSimApp.getEngineSettings());
    Editor._updateDisplay();

    // save load scene
    $('.world-status button#save').click(CrowdSimApp.save);
    $('.world-status button#load').click(CrowdSimApp.load);
    var notebook = $('#showRawData');
    $('.world-status button#show').click(function() {
      var show = notebook.hasClass('hide');
      if (show) {
        var raw = CrowdSimApp.save(false);
        $('#data').html(raw);
      }
      notebook.toggleClass('hide');
    });

    // init world loader
    var selectWorlds = $('.world-status select#worlds');
    $('button',notebook).click(function() {
      notebook.addClass('hide');
    });
    var worlds = CrowdSimApp.listExamples();
    for (var e in worlds) {
      var selected = e === 0 ? 'selected' : '';
      var option = $('<option value=' + worlds[e] + ' ' + selected + '>' + worlds[e] + '</option>');
      selectWorlds.append(option);
    }
    selectWorlds.change(function() {
      CrowdSimApp.loadExample($(this).find(':selected').val());
    });
    //selectWorlds.trigger('change');
  };

  Editor.modeToggle = function(mode) {
    $('.edit-modes button').removeClass('active');
    if (!mode || mode === Editor.modes.select) {
      Editor.currentMode = Editor.modes.select;
      $('.edit-modes button#' + Editor.currentMode.id).addClass('active');
    } else {
      // disabled all modes except current
      Editor.currentMode = mode;
      $('.edit-modes button#' + mode.id).addClass('active');
    }
    Editor._statusBarSet({
      'edit-mode': Editor.currentMode.label,
      'message': Editor.currentMode.message
    });
    $(Editor._canvas).css('cursor', Editor.currentMode.cursor);
  };

  Editor.engineChange = function(newStatus) {
    // toggle running/stop modes
    Editor.engineStatus = newStatus;
    var isRunning = newStatus.action(newStatus);
    $(Editor.buttons.run).toggleClass('hide', isRunning);
    $(Editor.buttons.stop).toggleClass('hide', !isRunning);
  };

  // updates entity panel with entity info and properties
  Editor._entityInfoSet = function(entityView) {
    var entity = entityView.entityModel;
    $('.entity-type', Editor.entityInfo).html(entity.constructor.type);
    $('.entity-id', Editor.entityInfo).html(entity.id);
    var util = Editor._helpers;
    util.createNumberInput($('.entity-x', Editor.entityInfo), entity.pos, 0);
    util.createNumberInput($('.entity-y', Editor.entityInfo), entity.pos, 1);
    var control = $('.entity-props', Editor.entityInfo);
    control.empty();
    util.createInputsRecursive(control, entity.options);
    util.createEntityLabel(control, entity.entities);
    util.createEntityLabel(control, entity.children);
  };

  // wires mouse and keyboard events to canvas/document/window
  Editor._events = function(canvas) {
    var $canvas = $(canvas),
      $document = $(document),
      $window = $(window);

    // canvas events
    $canvas.mousedown(mousedown)
      .mouseup(mouseup)
      .mousemove(mousemove)
      .mousewheel(mousewheel);
    $document.keydown(keydown)
      .keyup(keyup);

    // events for resizing canvas on resize or fullscreen
    function onFullScreen(event) {
        CrowdSimApp.resize(window);
      }
    $document.on('resize fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', onFullScreen);
    $window.on('resize fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', onFullScreen);
    $window.on('resize', onFullScreen);

    // mouse events for panning, selecting...
    var panningEvent;
    function mousedown(event) {
      var pos = CrowdSimApp.screenToWorld(event.clientX, event.clientY);
      CrowdSimApp.mousedown(event);
      switch (event.button) {
        case 0: // left button
          // add entities mode
          switch (Editor.currentMode) {
            case Editor.modes.select:
            break;
            case Editor.modes.edit:
              Editor._entityCreated = CrowdSimApp.getSelectedEntity();
            break;
            case Editor.modes.remove:
            break;
            case Editor.modes.addContext:
            case Editor.modes.addGroup:
            case Editor.modes.addPath:
            case Editor.modes.addWall:
              if (Editor._entityCreated) { // continue creating current entity
                Editor._entityCreated = CrowdSimApp.getCreatingEntity();
                if (!Editor._entityCreated) {
                  Editor._statusBarSetOne('message', 'Entity creation finished');
                }
              } else { // starts creating
                Editor._entityCreated = CrowdSimApp.createEntityStart(Editor.currentMode.entity, pos);
                Editor._statusBarSetOne('message', 'Entity creation mode starterd. Press ESC or right button to end');
              }
            break;
            default:
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

    // panning and dragging
    function mousemove(event) {
      CrowdSimApp.mousemove(event);
      if (panningEvent) {
        CrowdSimApp.pan(event.clientX - panningEvent.clientX, event.clientY - panningEvent.clientY);
        panningEvent = event;
        return;
      }
      if (Editor._entityCreated) {

      }
      var pos = CrowdSimApp.screenToWorld(event.clientX, event.clientY);
      Editor._statusBarSetOne('mouse', '(' + pos.x.toFixed(2) + ',' + pos.y.toFixed(2) + ')');
    }

    // end edition mode
    function mouseup(event) {
      CrowdSimApp.mouseup(event);
      var pos = {
        x: event.clientX,
        y: event.clientY
      };
      switch (event.button) {
        case 0: // left button
        break;
        case 1: // middle button for panning
          if (event.button === 1) {
            $canvas.css('cursor', 'default');
            panningEvent = null;
          }
        break;
        case 2: // right button
          if (Editor._entityCreated) { // ends creating action
            Editor._entityCreated = CrowdSimApp.createEntityEnd();
            Editor._statusBarSet('message', 'Entity creation mode finished');
          }
          return false;
      }
    }

    // zooming
    function mousewheel(event) {
      var cancel = CrowdSimApp.mousewheel(event);
      if (!cancel) {
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
    }

    // hotkeys
    function keydown(event) {
      switch (event.keyCode) { // ctrlKey shiftKey
        case 17: // ctrl
          CrowdSimApp.snapToGrid = false;
        break;
        case 27: // escape

          if (Editor._entityCreated) {
            // ends creation of current entity
            Editor._entityCreated = CrowdSimApp.createEntityEnd();
            Editor._statusBarSet('message', 'Entity creation mode finished');
          } else {
            // cancels mode creation
            Editor.modeToggle();
          }
          //Editor.modeToggle();
          Editor._entityCreated = null;
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
        default:
          //console.log(event);
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
  Editor._statusBarSetOne = function(id, value) {
    $(Editor.statuses[id]).html(value.toString());
  };

  Editor._statusBarSet = function(values) {
    for (var i in values) {
      if (!Editor.statuses[i]) {
        console.log('Status display not defined: ' + i);
      } else {
        Editor._statusBarSetOne(i, values[i]);
      }
    }
  };

  // updates lower status bar
  Editor._updateDisplay = function() {
    var setOpts = CrowdSimApp.getStats();
    Editor._statusBarSet(setOpts);
  };

  // inits all!
  Editor.init('canvas');
  return Editor;
})(jQuery);

//# sourceURL=Editor.js
