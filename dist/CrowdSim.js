(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global window,module, exports : true, define */
var Entity = require('./Entity');

var Agent = function(group, x, y, size) {
  Entity.call(this);

  this.id = Agent.id++;
  this.group = group;
  this.pos = {
    x: x,
    y: y
  };
  this.vel = {
    x: 0,
    y: 0
  };
  this.size = size;
  this.mobility = 1.0;
  this.behaviour = null; // individual dataset by group
};

Agent.prototype.step = function(step) {
  this.group.behavior(this, step);
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
    timestep: 10 / 60
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
  this.step();
};

Engine.prototype.step = function() {
  if (this.running) {
    return;
  }
  this.step();
};

Engine.prototype.step = function() {
  var world = this.world;
  var options = this.options;
  var timestep = options.timestep;
  var entities = this.world.entities;
  Lazy(entities.agents).each(function(agent) {
    if (agent.selected) {
      world.agentSelected = agent;
      return;
    }
    agent.step(timestep);
    if (options.onStep) {
      options.onStep(world);
    }
  });
  this.iterations++;
  if (this.running) {
    var that = this;
    setTimeout(function() {
      that.step();
    }, timestep);
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

var Group = function(world, agents, area, options) {
  Entity.call(this);
  options = Lazy(options).defaults({
    pos: function(area) {
      var x = area[0][0] + Math.random() * (area[1][0] - area[0][0]);
      var y = area[0][1] + Math.random() * (area[1][1] - area[0][1]);
      return [x, y];
    },
    size: function() {
      return 5;
    },
    behavior: this.behaviorWaypoints
  }).toObject();
  this.id = Group.id++;

  this.behavior = options.behavior;
  this.world = world;
  var that = this;
  this.agents = Lazy.generate(function(e) {
    var pos = options.pos(area);
    var size = isNaN(options.size) ? options.size() : options.size;
    return new Agent(that, pos[0], pos[1], size);
  }, agents).toArray();

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

Group.prototype.addAgent = function(agent) {
  this.agents.concat(agent);
};

Group.prototype.behaviorRandom = function(agent, step) {
  agentBehavior = agent.behavior;
  var desiredForce = {x: Math.random() * 2 - 1, y: Math.random() * 2 - 1};
}

Group.prototype.behaviorWaypoints = function(agent, step) {
  agentBehavior = agent.behavior;

  var accel = {x: Math.random() * 2 - 1, y: Math.random() * 2 - 1};
  agent.vel.x += accel.x * step;
  agent.vel.y += accel.y * step;
  //this.direction = Math.atan2(entity.vel.y, entity.vel.x);
  agent.pos.x += agent.vel.x * step;
  agent.pos.y += agent.vel.y * step;

  if (this.world.wrap) {
    if (agent.pos.x > this.world.MAX_X) {
      agent.pos.x = this.world.MIN_X + agent.pos.x - world.MAX_X;
    }
    if (agent.pos.x < this.world.MIN_X) {
      agent.pos.x = this.world.MAX_X - (this.world.MIN_X - entity.pos.x);
    }
    if (agent.pos.y > this.world.MAX_Y) {
      agent.pos.y = this.world.MIN_Y + entity.pos.y - this.world.MAX_Y;
    }
    if (agent.pos.y < this.world.MIN_Y) {
      agent.pos.y = this.world.MAX_Y - (this.world.MIN_Y - entity.pos.y);
    }
  }
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
var Entity = function(entity, container, display) {
  this.entitiyModel = entity;
  this.entitiyModel.extra.view = this;
  // add it the container so we see it on our screens..
  display.interactive = true;
  display.buttonMode = true;
  display.mouseover = this.mouseover;
  display.mouseout = this.mouseout;
  display._entityView = this;
  container.addChild(display);
  this.display = display;
};

Entity.prototype.update = function() {
  //this.display.clear();
};

Entity.prototype.mouseover = function() {
  var entity = this._entityView.entityModel;
  console.log(entity.id + ': Mouse Over');
  agent.selected = true;
};

Entity.prototype.mouseout = function() {
  this._entityView.entityModel.selected = false;
};

var Agent = function(agent, container, texture, debugContainer) {
  var sprite = new PIXI.Sprite(texture);
  if (debugContainer) {
    this.graphics = new PIXI.Graphics();
    debugContainer.addChild(this.graphics);
    this.circle = new PIXI.Circle(agent.pos.x, agent.pos.y, agent.size / 2);
  }
  //var display = new PIXI.Sprite(options.texture);
  Entity.call(this, agent, container, sprite);
  this.display.visible = Agent.show.body;
  this.display.anchor.set(0.5);
  //this.display.alpha = 0.5;
  this.display.height = agent.size;
  this.display.width = agent.size;
  this.display.position.x = agent.pos.x;
  this.display.position.y = agent.pos.y;
  this.update();
};

Agent.prototype.update = function() {
  if (!Agent.show || !Agent.show.all) {
    return;
  }
  Entity.prototype.update.call(this);

  var e = this.entitiyModel;
  this.display.position.set(e.pos.x, e.pos.y);
  direction =  Math.atan2(e.vel.y, e.vel.x) - Math.PI / 2;
  this.display.rotation = direction;
  if (this.circle) {
    this.graphics.clear();
    this.circle.x = e.pos.x;
    this.circle.y = e.pos.y;

    if (Agent.show.body) {
      this.graphics.lineStyle(1, Colors.Agent);
      this.graphics.drawShape(this.circle);
    }
    if (Agent.show.direction) {
      var scale = 10;
      this.graphics.moveTo(e.pos.x, e.pos.y);
      this.graphics.lineTo(e.pos.x + e.vel.x * scale, e.pos.y + e.vel.y * scale);
      this.graphics.endFill();
    }
  }

};
Agent.show = {body: true, direction: true, all: true};

var Wall = function(wall, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, wall, container, display);
  this.joints = [];
  for (var j in wall.path) {
    var joint = wall.path[j];
    var circle = new PIXI.Circle(joint[0], joint[1], wall.width);
    this.joints.push(circle);
  }
  this.update();
};

Wall.prototype.update = function(options) {
  if (!Wall.show || !Wall.show.all) {
    this.display.clear();
    return;
  }
  Entity.prototype.update.call(this);
  //this.display.clear();
  var path = wall.path;
  if (Wall.show.path) {
    //this.display.beginFill(Colors.Wall, 0.1);
    this.display.lineStyle(wall.width, Colors.Wall);
    this.display.moveTo(path[0][0], path[0][1]);
    for (var i = 1; i < path.length ; i++) {
      this.display.lineTo(path[i][0], path[i][1]);
    }
    //this.display.endFill();
  }
  if (Wall.show.corners) {
    this.display.beginFill(Colors.Joint);
    for (var j in this.joints) {
      this.display.drawShape(this.joints[j]);
    }
    this.display.endFill();
  }
};
Wall.show = {path: true, corners: true, all: true};

var Group = function(group, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, group, container, display);
  this.area = new PIXI.Rectangle(0, 0, 0, 0);
  var wps = group.waypoints;
  if (wps) {
    this.waypoints = [];
    for (var i in wps) {
      var wp = wps[i];
      var circle = new PIXI.Circle(wp[0], wp[1], 1);
      this.waypoints.push(circle);
    }
  }
  this.update();
};

Group.prototype.update = function(options) {
  if (!Group.show || !Group.show.all) {
    this.display.clear();
    return;
  }
  this.display.clear();
  Entity.prototype.update.call(this);
  var group = this.entitiyModel;
  if (!group.agents || group.agents.length === 0) {
    return;
  }
  if (Group.show.area) {
    var limits = group.getArea();
    this.area.x = limits.xmin;
    this.area.y = limits.ymin;
    this.area.width = limits.xmax - limits.xmin;
    this.area.height = limits.ymax - limits.ymin;

    this.display.beginFill(Colors.Group, 0.2);
    this.display.drawShape(this.area);
    this.display.endFill();
  }
  var wps = this.waypoints;
  if (Group.show.waypoints && wps) {
    this.display.lineStyle(1, Colors.Group);
    this.display.beginFill(Colors.Joint);
    for (var i in wps) {
      this.display.drawShape(wps[i]);
    }
    this.display.endFill();
    //
    this.display.moveTo(wps[0].x, wps[0].y);
    for (var j = 1; j < wps.length; j++) {
      this.display.lineTo(wps[j].x, wps[j].y);
    }
  }
};

Group.show = {area: true, waypoints: true, all: true};

module.exports.Agent = Agent;
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
  this.entities = {
    groups: [new CrowdSim.Group(this,0)],
    agents: [],
    walls: []
  };
  this.wrap = true;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
};

World.prototype.getDefaultGroup = function() {
  return this.entities.groups.first();
};

World.prototype.addGroup = function(group) {
  this.entities.groups = this.entities.groups.concat(group);
  this.entities.agents = this.entities.agents.concat(group.agents);
};

World.prototype.addWall = function(wall) {
  this.entities.walls = this.entities.walls.concat(wall);
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.entities.agents = JSON.parse(this.agentsSave);
};

module.exports = World;

},{}]},{},[2])


//# sourceMappingURL=CrowdSim.js.map