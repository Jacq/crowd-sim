(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Agent = function(group, x, y, size, options) {
  Entity.call(this);
  this.options = Lazy(options).defaults({
    debug: false
  }).toObject();
  this.id = Agent.id++;
  this.group = group;
  this.pos = Vec2.fromValues(x, y);
  this.vel = Vec2.create();
  this.size = size;
  this.mobility = 1.0;
  this.behavior = null; // function set by group
  this.maxAccel = 0.5; // m/s^2
  this.maxVel = 1; // m/seg
  this.mass = 80e3;
  if (this.options.debug) {
    this.debug = {};
  }
};

Agent.prototype.followPath = function(index) {
  if (this.group.path) {
    this.target = this.group.path.wps[index || 0];
    this.pathNextIdx = 1;
  } else {
    this.target = null;
    this.pathNextIdx = 0;
  }
};

Agent.prototype.step = function(stepSize) {
  var path = this.group.path;
  var accel = this.group.behavior.getAccel(this, this.target);
  this.move(accel, stepSize);
  // update target to next if arrive at current
  if (this.target) {
    var distToTarget = Vec2.distance(this.pos, this.target.pos);
    if (distToTarget < this.target.radius) {
      if (this.pathNextIdx < path.wps.length) {
        // follow to next waypoint
        this.target = path.wps[this.pathNextIdx++];
      } else {
        // arrived at last!
        this.pathNextIdx = null;
        this.target = null;
      }
    }
  }
};

Agent.prototype.move = function(accel, stepSize) {
  /*if (Vec2.length(accel) > this.maxAccel) {
    Vec2.normalizeAndScale(accel, accel, this.maxAccel);
  }*/
  Vec2.scaleAndAdd(this.vel, this.vel, accel, stepSize);

  if (Vec2.length(this.vel) > this.maxVel) {
    Vec2.normalizeAndScale(this.vel, this.vel, this.maxVel);
  }

  Vec2.scaleAndAdd(this.pos, this.pos, this.vel, stepSize * this.mobility);

  /*if (this.world.wrap) {
    if (agent.pos[0] > this.world.MAX_X) {
      agent.pos[0] = this.world.MIN_X + agent.pos[0] - world.MAX_X;
    }
    if (agent.pos[0] < this.world.MIN_X) {
      agent.pos[0] = this.world.MAX_X - (this.world.MIN_X - entity.pos[0]);
    }
    if (agent.pos[1] > this.world.MAX_Y) {
      agent.pos[1] = this.world.MIN_Y + entity.pos[1] - this.world.MAX_Y;
    }
    if (agent.pos[1] < this.world.MIN_Y) {
      agent.pos[1] = this.world.MAX_Y - (this.world.MIN_Y - entity.pos[1]);
    }
  }*/
};

Agent.id = 0;

module.exports = Agent;

},{"./Entity":5,"./Vec2":9}],2:[function(require,module,exports){
'use strict';

var Vec2 = require('./Vec2');

/**
 * Helbing-Farkas,Vicsek Simulating dynamical features of escape panic
 *
 * @param  {World} world [description]
 * @param  {Object} options [description]
 * {Vec2}       [description]
 */
var Panic = function(world, options) {
  this.options = Lazy(options).defaults({
    A: 2e3, // N
    B: 0.08, // m
    kn: 1.2e5, // kg s-2
    Kv: 2.4e5, //kg m-1 s-1
    relaxationTime: 0.3
  }).toObject();
  this.world = world;
};

// path point, point, other agent {point , radius}
Panic.prototype.getAccel = function(agent, target) {
  var desiredForce = Vec2.create();
  var agentsForce = Vec2.create();
  var wallsForce = Vec2.create();
  var accel = Vec2.create();
  var distanceToTarget;

  // check agent desired force
  Vec2.add(accel, agentsForce, wallsForce);
  if (target) { // agent is going somewhere?
    distanceToTarget = Vec2.distance(agent.pos, target.pos);
    if (distanceToTarget > target.radius) {
      Vec2.subtract(desiredForce, target.pos, agent.pos);
      if (Vec2.length(desiredForce) > agent.maxAccel) {
        Vec2.normalizeAndScale(desiredForce, desiredForce, agent.maxAccel * agent.mass);
      }
    }
  }

  // check other agents interaction
  var neighbours = this.world.getNeighbours(agent);
  if (neighbours.length) {
    for (var n in neighbours) {
      var neighbour = neighbours[n];
      if (neighbour !== agent) {
        var neighbourToAgentForce = this.calculateAgentForce(agent, neighbour);
        Vec2.add(agentsForce, agentsForce, neighbourToAgentForce);
      }
    }
  }

  // check walls interaction
  var walls = this.world.getNearWalls(agent);
  if (walls.length > 0) {
    for (var w in walls) { // check all walls
      var wall = walls[w];
      for (var s = 0; s < wall.path.length - 1; s++) { // check each segment of wall
        var projection = wall.getProjection(agent.pos, s);
        var wallsToAgentForce = this.calculateWallForce(agent, projection, wall.width);
        Vec2.add(wallsForce, wallsForce, wallsToAgentForce);
      }
    }
  }

  // fix to stay in place if no target is selected or already at target
  if (!target || distanceToTarget < target.radius) {
    Vec2.negate(desiredForce, agent.vel);
    Vec2.scale(desiredForce, desiredForce, this.options.relaxationTime);
    if (Vec2.length(desiredForce) > agent.maxAccel) {
      Vec2.normalizeAndScale(desiredForce, desiredForce, agent.maxAccel);
    }
  }

  Vec2.add3(accel, desiredForce, agentsForce, wallsForce);
  // return desiredForce + agentsForce + wallsForce;
  if (agent.debug) {
    agent.debug.forces = {
      desired: desiredForce,
      agents: agentsForce,
      walls: wallsForce
    };
  }
  //console.log(Vec2.str(desiredForce) + '|' + Vec2.str(agentsForce) + '|' + Vec2.str(wallsForce));
  return accel;
};

Panic.prototype.calculateAgentForce = function(i, j) {
  var interactionForce = Vec2.create();
  var rij = i.size + j.size;
  var dij = Vec2.distance(i.pos, j.pos);
  // ij direction
  var nijV2 = Vec2.create();
  Vec2.subtract(nijV2, i.pos, j.pos);
  Vec2.scale(nijV2, nijV2, 1 / dij);
  // ij tangencial direction
  var tijV2 = Vec2.fromValues(-nijV2[1], nijV2[0]);

  var rdij = rij - dij;
  Vec2.scale(interactionForce, nijV2, this.options.A * Math.exp(rdij / this.options.B));

  if (rdij > 0) { // agents touch each other
    // ij tangencial velocity
    Vec2.scaleAndAdd(interactionForce, interactionForce, nijV2, this.options.kn * rdij); // body force
    // sliding friction
    var vjiV2 = Vec2.create();
    Vec2.subtract(vjiV2, j.vel, i.vel);
    var deltaVji = Vec2.dot(vjiV2, tijV2);
    Vec2.scaleAndAdd(interactionForce, interactionForce, tijV2, this.options.Kv * rdij * deltaVji);
  }
  return interactionForce;
};

Panic.prototype.calculateWallForce = function(i, projection, width) {
  var interactionForce = Vec2.create();
  var rij = i.size + width;
  // ij direction
  var nijV2 = projection;
  var dij = Vec2.length(projection);
  Vec2.scale(nijV2, nijV2, 1 / dij);
  // ij tangencial direction
  var tijV2 = Vec2.fromValues(-nijV2[1], nijV2[0]);

  var rdij = rij - dij;
  Vec2.scale(interactionForce, nijV2, this.options.A * Math.exp(rdij / this.options.B));
  if (rdij > 0) { // agents touch each other
    // ij tangencial velocity
    var vjiV2 = Vec2.create();
    var dotViT = Vec2.dot(i.vel, tijV2);
    Vec2.scaleAndAdd(interactionForce, interactionForce, nijV2, this.options.kn * rdij); // body force
    Vec2.scaleAndAdd(interactionForce, interactionForce, tijV2, -this.options.Kv * rdij * dotViT);
  }
  return interactionForce;
};

module.exports.Panic = Panic;

},{"./Vec2":9}],3:[function(require,module,exports){
/* global window,module, exports : true, define */

var CrowdSim = {
  Agent: require('./Agent'),
  Group: require('./Group'),
  World: require('./World'),
  Wall: require('./Wall'),
  Path: require('./Path'),
  Engine: require('./Engine'),
  Render: require('./Render')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}

},{"./Agent":1,"./Engine":4,"./Group":6,"./Path":7,"./Render":8,"./Wall":10,"./World":11}],4:[function(require,module,exports){
'use strict';

var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.world.save();

  var defaultOptions = {
    timeStepSize: 0.1
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
  var timeStepSize = options.timeStepSize;
  var entities = this.world.entities;
  Lazy(entities.agents).each(function(agent) {
    agent.step(timeStepSize);
    if (agent.selected) {
      world.agentSelected = agent;
      return;
    }
  });
  Lazy(entities.groups).each(function(group) {
    group.step(timeStepSize);
  });

  this.iterations++;
  if (options.onStep) {
    options.onStep(world);
  }

  if (this.running) {
    var that = this;
    setTimeout(function() {
      that.step();
    }, options.timeStepRun * 1000);
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

},{}],5:[function(require,module,exports){

var Entity = function() {
  this.extra = {};
};

module.exports = Entity;

},{}],6:[function(require,module,exports){
'use strict';

var Agent = require('./Agent');
var Behavior = require('./Behavior');
var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Group = function(agentsNumber, world, initArea, options) {
  Entity.call(this);
  this._initArea = initArea;
  this.options = Lazy(options).defaults({
    pos: function(area) {
      var x = area[0][0] + Math.random() * (area[1][0] - area[0][0]);
      var y = area[0][1] + Math.random() * (area[1][1] - area[0][1]);
      return Vec2.fromValues(x, y);
    },
    size: function() {
      return 0.5;
    },
    behavior: new Behavior.Panic(world),
    debug: false,
    birth: {prob: 0, // births per step
             rate: 0} // birth probability per step
  }).toObject();
  this.id = Group.id++;

  this.behavior = this.options.behavior;
  this.world = world;
  this.agents = [];

  var newAgents = this.generateAgents(agentsNumber);
  this.agents = this.agents.concat(newAgents);

  if (this.options.path) {
    this.assignPath(options.path);
  }
};

Group.prototype.assignPath = function(path) {
  this.path = path;
  for (var i  in this.agents) {
    this.agents[i].followPath();
  }
};

Group.prototype.generateAgents = function(agentsNumber, initArea) {
  if (!initArea) {
    initArea = this._initArea;
  }
  var newAgents = [];
  for (var i = 0; i < agentsNumber; i++) {
    var pos = this.options.pos(this._initArea);
    var size = isNaN(this.options.size) ? this.options.size() : this.options.size;
    var agent = new Agent(this, pos[0], pos[1], size, {debug: this.options.debug});
    agent.followPath();
    newAgents.push(agent);
  }
  return newAgents;
};

Group.prototype.addAgents = function(agentsNumber, initArea) {
  var newAgents = this.generateAgents(agentsNumber);

  this.world.addAgents(newAgents);
};

Group.prototype.addAgent = function(x, y) {
  var size = isNaN(this.options.size) ? this.options.size() : this.options.size;
  var agent = new Agent(this, x, y, size);
  this.agents.push(agent);
};

Group.prototype.getInitArea = function() {
  return this._initArea;
};

Group.prototype.getArea = function() {
  return [
    Vec2.fromValues(
      Lazy(this.agents).map(function(e) { return e.pos[0] - e.size; }).min(),
      Lazy(this.agents).map(function(e) { return e.pos[0] + e.size; }).max()
    ),
    Vec2.fromValues(
      Lazy(this.agents).map(function(e) { return e.pos[1] - e.size; }).min(),
      Lazy(this.agents).map(function(e) { return e.pos[1] + e.size; }).max()
    )
  ];
};

Group.prototype.addAgent = function(agent) {
  this.agents.concat(agent);
};

Group.prototype.step = function() {
  var birth = this.options.birth;
  if (birth && birth.rate > 0 && birth.prob > 0) {
    var prob = Math.random();
    if (prob < birth.prob) {
      this.addAgents(birth.rate);
    }
  }
};

Group.id = 0;

module.exports = Group;

},{"./Agent":1,"./Behavior":2,"./Entity":5,"./Vec2":9}],7:[function(require,module,exports){
'use strict';

var Entity = require('./Entity');

var Path = function(waypoints) {
  Entity.call(this);
  if (!waypoints || waypoints.length < 2) {
    throw 'Waypoints must have at least two points';
  }
  this.id = Path.id++;
  this.wps = waypoints;
};

Path.prototype.reverse = function() {
  this.wps = Lazy(this.wps).reverse().toArray();
};

Path.id = 0;

module.exports = Path;

},{"./Entity":5}],8:[function(require,module,exports){
'use strict';

var Vec2 = require('./Vec2');

var Colors = {
  Agent: 0xFF0000,
  Wall: 0x00FF00,
  Group: 0xe1eca0,
  Joint: 0xFFFFFF,
  Path: 0xe00c7b,
  Waypoint: 0x7a7a7a,
  Forces: {desired: 0xfffff,
          agents: 0xFF0000,
          walls: 0xc49220
          }
};

var Font = {
  default: {font: '2px Snippet', fill: 'white', align: 'left'}
};
/*
* Base render prototype
*/
var Entity = function(entity, container, display) {
  this.entityModel = entity;
  this.entityModel.extra.view = this;
  // add it the container so we see it on our screens..
  display.interactive = true;
  display.buttonMode = true;
  display.mouseover = this.mouseover;
  display.mouseout = this.mouseout;
  display._entityView = this;
  container.addChild(display);
  this.display = display;
};

Entity.prototype.render = function() {
  //this.display.clear();
};

Entity.prototype.mouseover = function() {
  var entity = this._entityView.entityModel;
  console.log(entity.id + ': Mouse Over');
  entity.selected = true;
};

Entity.prototype.mouseout = function() {
  this._entityView.entityModel.selected = false;
};

var Agent = function(agent, container, texture, debugContainer) {
  var sprite = new PIXI.Sprite(texture);
  if (debugContainer) {
    this.graphics = new PIXI.Graphics();
    debugContainer.addChild(this.graphics);
    this.circle = new PIXI.Circle(agent.pos[0], agent.pos[1], agent.size / 2);
  }
  //var display = new PIXI.Sprite(options.texture);
  Entity.call(this, agent, container, sprite);
  this.display.visible = Agent.show.body;
  this.display.anchor.set(0.5);
  //this.display.alpha = 0.5;
  this.display.height = agent.size;
  this.display.width = agent.size;
  this.display.position.x = agent.pos[0];
  this.display.position.y = agent.pos[1];
  this.render();
};

Agent.prototype.render = function() {
  if (!Agent.show || !Agent.show.all) {
    return;
  }
  Entity.prototype.render.call(this);

  var e = this.entityModel;
  this.display.position.set(e.pos[0], e.pos[1]);
  this.display.rotation = Math.atan2(e.vel[1], e.vel[0]) - Math.PI / 2;
  if (this.circle) {
    this.graphics.clear();
    this.circle.x = e.pos[0];
    this.circle.y = e.pos[1];

    if (Agent.show.body) {
      this.graphics.lineStyle(0.1, Colors.Agent);
      this.graphics.drawShape(this.circle);
    }
    if (Agent.show.direction) {
      var scale = 10;
      this.graphics.moveTo(e.pos[0], e.pos[1]);
      this.graphics.lineTo(e.pos[0] + e.vel[0], e.pos[1] + e.vel[1]);
    }
    if (e.debug && e.debug.forces) {
      var force = Vec2.create();
      for (var f in e.debug.forces) {
        this.graphics.lineStyle(0.1, Colors.Forces[f]);
        this.graphics.moveTo(e.pos[0], e.pos[1]);
        Vec2.normalize(force,e.debug.forces[f]);
        this.graphics.lineTo(e.pos[0] + force[0], e.pos[1] + force[1]);
      }
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
    var text = new PIXI.Text(j, Font.default);
    text.resolution = 12;
    text.x = joint[0];
    text.y = joint[1];
    display.addChild(text);
    this.joints.push(circle);
  }
  this.render();
};

Wall.prototype.render = function(options) {
  if (!Wall.show || !Wall.show.all) {
    this.display.clear();
    return;
  }
  Entity.prototype.render.call(this);
  //this.display.clear();
  var wall = this.entityModel;
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
  if (Wall.show.joints) {
    this.display.beginFill(Colors.Joint);
    for (var j in this.joints) {
      this.display.drawShape(this.joints[j]);
    }
    this.display.endFill();
  }
};
Wall.show = {path: true, joints: true, all: true};

var Group = function(group, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, group, container, display);
  this.area = new PIXI.Rectangle(0, 0, 0, 0);
  this.render();
};

Group.prototype.render = function(options) {
  if (!Group.show || !Group.show.all) {
    this.display.clear();
    return;
  }
  this.display.clear();
  Entity.prototype.render.call(this);
  var group = this.entityModel;
  if (!group.agents || group.agents.length === 0) {
    return;
  }
  if (Group.show.area) {
    var limits = group.getInitArea();
    this.area.x = limits[0][0];
    this.area.y = limits[0][1];
    this.area.width = limits[1][0] - limits[0][0];
    this.area.height = limits[1][1] - limits[0][1];

    this.display.beginFill(Colors.Group, 0.2);
    this.display.drawShape(this.area);
    this.display.endFill();
  }
};

Group.show = {area: true, waypoints: true, all: true};

var Path = function(path, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, path, container, display);
  var wps = path.wps;
  if (wps && wps.length > 0) {
    this.joints = [];
    for (var i in wps) {
      var wp = wps[i];
      var circle = new PIXI.Circle(wp.pos[0], wp.pos[1], wp.radius);
      this.joints.push(circle);
    }
  }
  this.render();
};

Path.prototype.render = function(options) {
  if (!Path.show || !Path.show.all) {
    this.display.clear();
    return;
  }
  Entity.prototype.render.call(this);
  var path = this.entityModel;
  if (Path.show.joints && this.joints && this.joints.length > 0) {
    this.display.lineStyle(0.1, Colors.Path);
    this.display.moveTo(this.joints[0].x, this.joints[0].y);
    for (var lj = 1; lj < this.joints.length; lj++) {
      this.display.lineTo(this.joints[lj].x, this.joints[lj].y);
    }
    //this.display.beginFill(Colors.Joint);
    for (var j in this.joints) {
      this.display.drawShape(this.joints[j]);
    }
    //this.display.endFill();

  }
};

Path.show = {path: true, joints: true, all: true};

module.exports.Path = Path;
module.exports.Agent = Agent;
module.exports.Wall = Wall;
module.exports.Group = Group;

},{"./Vec2":9}],9:[function(require,module,exports){
/* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE. */

/**
 * @class Common utilities
 * @name glMatrix
 */
var glMatrix = {};

// Constants
glMatrix.EPSILON = 0.000001;
glMatrix.ARRAY_TYPE = (typeof Float32Array !== 'undefined') ? Float32Array : Array;
glMatrix.RANDOM = Math.random;
glMatrix.SIMD_AVAILABLE = (glMatrix.ARRAY_TYPE !== Array) && ('SIMD' in this);
glMatrix.ENABLE_SIMD = false;

/**
 * Sets the type of array used when creating new vectors and matrices
 *
 * @param {Type} type Array type, such as Float32Array or Array
 */
glMatrix.setMatrixArrayType = function(type) {
    glMatrix.ARRAY_TYPE = type;
}

var degree = Math.PI / 180;

/**
* Convert Degree To Radian
*
* @param {Number} Angle in Degrees
*/
glMatrix.toRadian = function(a){
     return a * degree;
}

/**
 * @class 2 Dimensional Vector
 * @name vec2
 */
var vec2 = {};

/**
 * Creates a new, empty vec2
 *
 * @returns {vec2} a new 2D vector
 */
vec2.create = function() {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
};

/**
 * Creates a new vec2 initialized with values from an existing vector
 *
 * @param {vec2} a vector to clone
 * @returns {vec2} a new 2D vector
 */
vec2.clone = function(a) {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Creates a new vec2 initialized with the given values
 *
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} a new 2D vector
 */
vec2.fromValues = function(x, y) {
    var out = new glMatrix.ARRAY_TYPE(2);
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Copy the values from one vec2 to another
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the source vector
 * @returns {vec2} out
 */
vec2.copy = function(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    return out;
};

/**
 * Set the components of a vec2 to the given values
 *
 * @param {vec2} out the receiving vector
 * @param {Number} x X component
 * @param {Number} y Y component
 * @returns {vec2} out
 */
vec2.set = function(out, x, y) {
    out[0] = x;
    out[1] = y;
    return out;
};

/**
 * Adds two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.add = function(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    return out;
};

/**
 * Subtracts vector b from vector a
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.subtract = function(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    return out;
};

/**
 * Alias for {@link vec2.subtract}
 * @function
 */
vec2.sub = vec2.subtract;

/**
 * Multiplies two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.multiply = function(out, a, b) {
    out[0] = a[0] * b[0];
    out[1] = a[1] * b[1];
    return out;
};

/**
 * Alias for {@link vec2.multiply}
 * @function
 */
vec2.mul = vec2.multiply;

/**
 * Divides two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.divide = function(out, a, b) {
    out[0] = a[0] / b[0];
    out[1] = a[1] / b[1];
    return out;
};

/**
 * Alias for {@link vec2.divide}
 * @function
 */
vec2.div = vec2.divide;

/**
 * Returns the minimum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.min = function(out, a, b) {
    out[0] = Math.min(a[0], b[0]);
    out[1] = Math.min(a[1], b[1]);
    return out;
};

/**
 * Returns the maximum of two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec2} out
 */
vec2.max = function(out, a, b) {
    out[0] = Math.max(a[0], b[0]);
    out[1] = Math.max(a[1], b[1]);
    return out;
};

/**
 * Scales a vec2 by a scalar number
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to scale
 * @param {Number} b amount to scale the vector by
 * @returns {vec2} out
 */
vec2.scale = function(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    return out;
};

/**
 * Adds two vec2's after scaling the second operand by a scalar value
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} scale the amount to scale b by before adding
 * @returns {vec2} out
 */
vec2.scaleAndAdd = function(out, a, b, scale) {
    out[0] = a[0] + (b[0] * scale);
    out[1] = a[1] + (b[1] * scale);
    return out;
};

/**
 * Calculates the euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} distance between a and b
 */
vec2.distance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.distance}
 * @function
 */
vec2.dist = vec2.distance;

/**
 * Calculates the squared euclidian distance between two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} squared distance between a and b
 */
vec2.squaredDistance = function(a, b) {
    var x = b[0] - a[0],
        y = b[1] - a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredDistance}
 * @function
 */
vec2.sqrDist = vec2.squaredDistance;

/**
 * Calculates the length of a vec2
 *
 * @param {vec2} a vector to calculate length of
 * @returns {Number} length of a
 */
vec2.length = function (a) {
    var x = a[0],
        y = a[1];
    return Math.sqrt(x*x + y*y);
};

/**
 * Alias for {@link vec2.length}
 * @function
 */
vec2.len = vec2.length;

/**
 * Calculates the squared length of a vec2
 *
 * @param {vec2} a vector to calculate squared length of
 * @returns {Number} squared length of a
 */
vec2.squaredLength = function (a) {
    var x = a[0],
        y = a[1];
    return x*x + y*y;
};

/**
 * Alias for {@link vec2.squaredLength}
 * @function
 */
vec2.sqrLen = vec2.squaredLength;

/**
 * Negates the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to negate
 * @returns {vec2} out
 */
vec2.negate = function(out, a) {
    out[0] = -a[0];
    out[1] = -a[1];
    return out;
};

/**
 * Returns the inverse of the components of a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to invert
 * @returns {vec2} out
 */
vec2.inverse = function(out, a) {
  out[0] = 1.0 / a[0];
  out[1] = 1.0 / a[1];
  return out;
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @returns {vec2} out
 */
vec2.normalize = function(out, a) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = 1 / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

/**
 * Calculates the dot product of two vec2's
 *
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} dot product of a and b
 */
vec2.dot = function (a, b) {
    return a[0] * b[0] + a[1] * b[1];
};

/**
 * Computes the cross product of two vec2's
 * Note that the cross product must by definition produce a 3D vector
 *
 * @param {vec3} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {vec3} out
 */
vec2.cross = function(out, a, b) {
    var z = a[0] * b[1] - a[1] * b[0];
    out[0] = out[1] = 0;
    out[2] = z;
    return out;
};

/**
 * Performs a linear interpolation between two vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {Number} t interpolation amount between the two inputs
 * @returns {vec2} out
 */
vec2.lerp = function (out, a, b, t) {
    var ax = a[0],
        ay = a[1];
    out[0] = ax + t * (b[0] - ax);
    out[1] = ay + t * (b[1] - ay);
    return out;
};

/**
 * Generates a random vector with the given scale
 *
 * @param {vec2} out the receiving vector
 * @param {Number} [scale] Length of the resulting vector. If ommitted, a unit vector will be returned
 * @returns {vec2} out
 */
vec2.random = function (out, scale) {
    scale = scale || 1.0;
    var r = glMatrix.RANDOM() * 2.0 * Math.PI;
    out[0] = Math.cos(r) * scale;
    out[1] = Math.sin(r) * scale;
    return out;
};

/**
 * Transforms the vec2 with a mat2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y;
    out[1] = m[1] * x + m[3] * y;
    return out;
};

/**
 * Transforms the vec2 with a mat2d
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat2d} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat2d = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[2] * y + m[4];
    out[1] = m[1] * x + m[3] * y + m[5];
    return out;
};

/**
 * Transforms the vec2 with a mat3
 * 3rd vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat3} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat3 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[3] * y + m[6];
    out[1] = m[1] * x + m[4] * y + m[7];
    return out;
};

/**
 * Transforms the vec2 with a mat4
 * 3rd vector component is implicitly '0'
 * 4th vector component is implicitly '1'
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the vector to transform
 * @param {mat4} m matrix to transform with
 * @returns {vec2} out
 */
vec2.transformMat4 = function(out, a, m) {
    var x = a[0],
        y = a[1];
    out[0] = m[0] * x + m[4] * y + m[12];
    out[1] = m[1] * x + m[5] * y + m[13];
    return out;
};

/**
 * Perform some operation over an array of vec2s.
 *
 * @param {Array} a the array of vectors to iterate over
 * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
 * @param {Number} offset Number of elements to skip at the beginning of the array
 * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
 * @param {Function} fn Function to call for each vector in the array
 * @param {Object} [arg] additional argument to pass to fn
 * @returns {Array} a
 * @function
 */
vec2.forEach = (function() {
    var vec = vec2.create();

    return function(a, stride, offset, count, fn, arg) {
        var i, l;
        if(!stride) {
            stride = 2;
        }

        if(!offset) {
            offset = 0;
        }

        if(count) {
            l = Math.min((count * stride) + offset, a.length);
        } else {
            l = a.length;
        }

        for(i = offset; i < l; i += stride) {
            vec[0] = a[i]; vec[1] = a[i+1];
            fn(vec, vec, arg);
            a[i] = vec[0]; a[i+1] = vec[1];
        }

        return a;
    };
})();

/**
 * Returns a string representation of a vector
 *
 * @param {vec2} vec vector to represent as a string
 * @returns {String} string representation of the vector
 */
vec2.str = function (a) {
    return 'vec2(' + a[0] + ', ' + a[1] + ')';
};

module.exports = vec2;

/**
 * Adds three vec2's
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @param {vec2} c the third operand
 * @returns {vec2} out
 */
vec2.add3 = function(out, a, b, c) {
    out[0] = a[0] + b[0] + c[0];
    out[1] = a[1] + b[1] + c[1];
    return out;
};

/**
 * Calculates the shortest projection between a point and a line defined by two vec2's
 *
 * @param {vec2} p the point
 * @param {vec2} a the first operand
 * @param {vec2} b the second operand
 * @returns {Number} projection between p and the line defined a and b
 */
vec2.projectionToSegment = function(out, p, a, b) {
  var l2 = vec2.squaredDistance(a, b);
  if (l2 === 0) return vec2.subtract(out, p, a); // point to line of one point
  // tangencial projection
  var t = ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1])) / l2;
  if (t < 0) return vec2.subtract(out, p, a); // beyond a
  if (t > 1) return vec2.subtract(out, p, b); // beyond b
  // projection within a-b
  vec2.lerp(out,a,b,t);
  return vec2.subtract(out, p, out);
};

/**
 * Normalize a vec2
 *
 * @param {vec2} out the receiving vector
 * @param {vec2} a vector to normalize
 * @param {Number} scale the amount to scale a by after normalize
 * @returns {vec2} out
 */
vec2.normalizeAndScale = function(out, a, b) {
    var x = a[0],
        y = a[1];
    var len = x*x + y*y;
    if (len > 0) {
        //TODO: evaluate use of glm_invsqrt here?
        len = b / Math.sqrt(len);
        out[0] = a[0] * len;
        out[1] = a[1] * len;
    }
    return out;
};

},{}],10:[function(require,module,exports){

var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Wall = function(path, options) {
  Entity.call(this);
  if (!path || path.length < 2) {
    throw 'Walls must have at least two points';
  }
  this.width = this.options ? options.width || 0.2 : 0.2;
  this.path = path; // n joints, n-1 sections
};

Wall.prototype.getProjection = function(point, segment) {
  if (segment < 0 || segment >= this.path.length - 1) {
    throw 'Segment out of bounds';
  }
  var projection = Vec2.create();
  return Vec2.projectionToSegment(projection, point, this.path[segment], this.path[segment + 1]);
};

module.exports = Wall;

},{"./Entity":5,"./Vec2":9}],11:[function(require,module,exports){
'use strict';
/* global CrowdSim */

var World = function(x1, y1, x2, y2) {
  var that = this;
  this.entities = {
    groups: [new CrowdSim.Group(0, that)],
    agents: [],
    walls: [],
    paths: []
  };
  this.wrap = true;
  this.x1 = x1;
  this.y1 = y1;
  this.x2 = x2;
  this.y2 = y2;
};

World.prototype.getDefaultGroup = function() {
  return this.entities.groups[0];
};

World.prototype.addGroup = function(group) {
  this.entities.groups = this.entities.groups.concat(group);
  group.onNewAgents = this.onNewAgents;
  this.addAgents(group.agents);
};

World.prototype.addAgents = function(agents) {
  this.entities.agents = this.entities.agents.concat(agents);
};

World.prototype.addWall = function(wall) {
  this.entities.walls = this.entities.walls.concat(wall);
};

World.prototype.addPath = function(path) {
  this.entities.paths = this.entities.paths.concat(path);
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.entities.agents = JSON.parse(this.agentsSave);
};

World.prototype.getNeighbours = function(agent) {
  return this.entities.agents;
};

World.prototype.getNearWalls = function(agent) {
  return this.entities.walls;
};

module.exports = World;

},{}]},{},[3])


//# sourceMappingURL=CrowdSim.js.map