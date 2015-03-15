(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global window,module, exports : true, define */
var Entity = require('./Entity');

var Agent = function(x, y, size) {
  Entity.call(this);

  this.id = Agent.id++;
  this.pos = {
    x: x,
    y: y
  };
  this.vel = {
    x: 0,
    y: 0
  };
  this.size = size;
  this.waypoint = null;
};

Agent.prototype.step = function(world, step) {
  if (this.waypoint) { // move by waypoint

  }
  var accel = {x: Math.random() * 2 - 1, y: Math.random() * 2 - 1};
  this.vel.x += accel.x * step;
  this.vel.y += accel.y * step;
  //this.direction = Math.atan2(entity.vel.y, entity.vel.x);
  this.pos.x += this.vel.x * step;
  this.pos.y += this.vel.y * step;

  if (world.wrap) {
    if (this.pos.x > world.MAX_X) {
      this.pos.x = world.MIN_X + this.pos.x - world.MAX_X;
    }
    if (this.pos.x < world.MIN_X) {
      this.pos.x = world.MAX_X - (world.MIN_X - entity.pos.x);
    }
    if (this.pos.y > world.MAX_Y) {
      this.pos.y = world.MIN_Y + entity.pos.y - world.MAX_Y;
    }
    if (this.pos.y < world.MIN_Y) {
      this.pos.y = world.MAX_Y - (world.MIN_Y - entity.pos.y);
    }
  }
};
Agent.id = 0;

module.exports = Agent;

},{"./Entity":4}],2:[function(require,module,exports){
/* global window,module, exports : true, define */

var CrowdSim = {
  Agent: require('./Agent'),
  Group: require('./Group'),
  World: require('./World'),
  Wall: require('./Wall'),
  Engine: require('./Engine'),
  Render: require('./Render')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}

},{"./Agent":1,"./Engine":3,"./Group":5,"./Render":6,"./Wall":7,"./World":8}],3:[function(require,module,exports){

var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.world.save();

  var defaultOptions = {
    step: 0.1
  };
  this.options = Lazy(options).defaults(defaultOptions).toObject();
};

Engine.prototype.setWorld = function(world) {
  this.world = world;
};

Engine.prototype.getWorld = function() {
  return this.world;
};

Engine.prototype.run = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  this._step();
};

Engine.prototype.step = function() {
  if (this.running) {
    return;
  }
  this._step();
};

Engine.prototype._step = function() {
  var world = this.world;
  var options = this.options;
  this.world.getAgents().each(function(agent) {
    if (agent.selected) {
      world.agentSelected = agent;
      return;
    }
    agent.step(world,options.step);
    if (options.onStep) {
      options.onStep(world);
    }
  });
  this.iterations++;
  if (this.running) {
    var that = this;
    setTimeout(function() {
      that._step();
    }, this.STEP);
  }
};

Engine.prototype.stop = function() {
  if (!this.running) {
    return;
  }
  this.running = false;
};
Engine.prototype.reset = function() {
  this.iterations = 0;
  this.running = false;
  this.world.restore();
};

module.exports = Engine;

},{}],4:[function(require,module,exports){

var Entity = function() {
  this.extra = {};
};

module.exports = Entity;

},{}],5:[function(require,module,exports){
var Agent = require('./Agent');
var Entity = require('./Entity');

var Group = function(total, area, options) {
  Entity.call(this);

  options = Lazy(options).defaults({
    pos: function(area) {
      var x = area[0][0] + Math.random() * (area[1][0] - area[0][0]);
      var y = area[0][1] + Math.random() * (area[1][1] - area[0][1]);
      return [x, y];
    },
    size: function() {
      return 5;
    }
  }).toObject();
  this.id = Group.id++;

  this.agents = Lazy.generate(function(e) {
    var pos = options.pos(area);
    var size = isNaN(options.size) ? options.size() : options.size;
    return new Agent(pos[0], pos[1], size);
  }, total).toArray();

  if (options.waypoints) {
    this.waypoints = options.waypoints;
  }
};

Group.prototype.addAgent = function(agent) {
  this.agents.push(agent);
};

Group.prototype.getArea = function() {
  return {
    xmin: Lazy(this.agents).map(function(e) { return e.pos.x - e.size; }).min(),
    xmax: Lazy(this.agents).map(function(e) { return e.pos.x + e.size; }).max(),
    ymin: Lazy(this.agents).map(function(e) { return e.pos.y - e.size; }).min(),
    ymax: Lazy(this.agents).map(function(e) { return e.pos.y + e.size; }).max()
  };
};

Group.id = 0;

module.exports = Group;

},{"./Agent":1,"./Entity":4}],6:[function(require,module,exports){

var Colors = {
  Agent: 0xFF0000,
  Wall: 0x00FF00,
  Group: 0xe1eca0,
  Joint: 0xFFFFFF,
  Waypoint: 0x7a7a7a
};

/*
* Base render prototype
*/
var Entity = function(entity, stage) {
  this.entitiyModel = entity;
  this.entitiyModel.extra.view = this;
  this.graphics = new PIXI.Graphics();
  // add it the stage so we see it on our screens..
  this.graphics.interactive = true;
  this.graphics.buttonMode = true;
  this.graphics.mouseover = this.mouseover;
  this.graphics.mouseout = this.mouseout;
  this.graphics._entityView = this;
  stage.addChild(this.graphics);
};

Entity.prototype.render = function() {
  this.graphics.clear();
};

Entity.prototype.mouseover = function() {
  var entity = this._entityView.entityModel;
  console.log(entity.id + ': Mouse Over');
  agent.selected = true;
};

Entity.prototype.mouseout = function() {
  this._entityView.entityModel.selected = false;
};

var Agent = function(agent, stage) {
  Entity.call(this, agent, stage);
  this.circle = new PIXI.Circle(agent.pos.x, agent.pos.y, agent.size);
  this.text = new PIXI.Text(agent.id, {font: '12px Arial', fill: 'yellow'});
  this.text.pos = agent.pos;
  this.text.anchor.x = 0.5;
  this.text.anchor.y = 0.5;
  this.graphics.drawShape(this.circle);
  //stage.addChild(this.text);
};

Agent.prototype.render = function() {
  Entity.prototype.render.call(this);
  var e = this.entitiyModel;
  // direction line
  this.graphics.lineStyle(1, Colors.Agent);
  this.circle.x = e.pos.x;
  this.circle.y = e.pos.y;
  this.graphics.beginFill(Colors.Agent);
  this.graphics.drawShape(this.circle);
  this.graphics.moveTo(e.pos.x, e.pos.y);
  var endX = Math.cos(e.direction);
  var endY = Math.sin(e.direction);
  var scale = 10;
  this.graphics.lineTo(e.pos.x + e.vel.x * scale, e.pos.y + e.vel.y * scale);
  //console.log(e);
};

var Wall = function(wall, stage) {
  Entity.call(this, wall, stage);
  this.joints = [];
  for (var i in wall.path) {
    var joint = wall.path[i];
    this.joints.push(new PIXI.Circle(joint[0], joint[1], wall.width));
  }
};

Wall.prototype.render = function() {
  Entity.prototype.render.call(this);
  var wall = this.entitiyModel;
  this.graphics.lineStyle(wall.width, Colors.Wall);
  var path = wall.path;
  this.graphics.moveTo(path[0][0], path[0][1]);
  for (var i = 1; i < path.length ; i++) {
    this.graphics.lineTo(path[i][0], path[i][1]);
  }
  for (var j = 0; j < this.joints ; j++) {
    this.graphics.drawShape(this.joints[j]);
  }

};

var Group = function(group, stage) {
  Entity.call(this, group, stage);
  var limits = group.getArea();
  this.area = new PIXI.Rectangle(limits.xmin, limits.ymin, limits.xmax - limits.xmin, limits.ymax - limits.ymin);
  if (group.waypoints) {
    this.waypoints = [];
    var wps = group.waypoints;
    this.graphics.beginFill(Colors.Joint);
    for (var i in wps) {
      var wp = wps[i];
      var circle = new PIXI.Circle(wp[0], wp[1], 1);
      this.waypoints.push(circle);
      this.graphics.drawShape(circle);
    }
  }
};

Group.prototype.render = function() {
  Entity.prototype.render.call(this);
  var group = this.entitiyModel;
  if (!group.agents || group.agents.length === 0) {
    return;
  }
  this.graphics.lineStyle(1, Colors.Group);
  var limits = group.getArea();
  this.area.x = limits.xmin;
  this.area.y = limits.ymin;
  this.area.width = limits.xmax - limits.xmin;
  this.area.height = limits.ymax - limits.ymin;
  this.graphics.drawShape(this.area);
  if (group.waypoints) {
    this.graphics.lineStyle(1, Colors.Waypoint);
    var wps = group.waypoints;
    this.graphics.moveTo(wps[0][0], wps[0][1]);
    for (var i = 1; i < wps.length; i++) {
      this.graphics.lineTo(wps[i][0], wps[i][1]);
    }

    for (var j = 0; j < this.waypoints.length; j++) {
      this.graphics.drawShape(this.waypoints[j]);
    }

  }
};

module.exports.Agent = Agent;
module.exports.Wall = Wall;
module.exports.Group = Group;

},{}],7:[function(require,module,exports){

var Entity = require('./Entity');

var Wall = function(path, options) {
  Entity.call(this);
  if (!path || path.length < 2) {
    throw 'Walls must have at least two points';
  }
  this.width = this.options ? options.width || 2 : 2;
  this.path = path;
};

module.exports = Wall;

},{"./Entity":4}],8:[function(require,module,exports){
/* global window,module, exports : true, define */

var World = function(x1, y1, x2, y2) {
  this.groups = [new CrowdSim.Group(0)];
  this.walls = [];
  this.wrap = true;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
};

World.prototype.getDefaultGroup = function() {
  return this.groups[0];
};

World.prototype.addGroup = function(group) {
  this.groups = Lazy(this.groups).concat(group);
};

World.prototype.addWall = function(wall) {
  this.walls = Lazy(this.walls).concat(wall);
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.agents = JSON.parse(this.agentsSave);
};

World.prototype.getGroups = function() {
  return Lazy(this.groups);
};

World.prototype.getAgents = function() {
  return Lazy(this.groups).map(function(g) { return g.agents; }).flatten();
};

World.prototype.getWalls = function() {
  return Lazy(this.walls);
};

module.exports = World;

},{}]},{},[2])


//# sourceMappingURL=CrowdSim.js.map