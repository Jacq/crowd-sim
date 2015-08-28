require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Vec2 = require('./Common/Vec2');

var Agent = function(x, y, group, options) {
  var that = this;
  this.id = Agent.id++;
  // merge options with agent
  Lazy(options).defaults(Agent.defaults).each(function(v, k) {
    that[k] = v;
  });
  this.pos = Vec2.fromValues(x, y);
  this.vel = Vec2.create();
  this.group = group;
  this.currentMobility = this.mobility;
  if (this.debug) {
    this.debug = {};
  }
  if (this.path) {
    this.followPath(this.path, this.pathStart);
  } else if (this.group.getEndContext()) {
    this.setTargetInContext(this.group.getEndContext());
  } else {
    this.target = this.group;
  }
};

Agent.prototype.setTargetInContext = function(context) {
  // go to nearest point in contexts
  var point = context.getNearestPoint(this.pos);
  // generate virtual target
  this.target = {pos: point, in: context.in.bind(context)};
};

Agent.prototype.getAspect = function() {
  return this.aspect;
};

Agent.prototype.getRadius = function() {
  return this.radius;
};

Agent.prototype.setCurrentMobility = function(mobility) {
  this.currentMobility = mobility;
};

Agent.prototype.followPath = function(path, index) {
  index = index || 0;
  this.path = path;
  if (path) {
    this.pathStartIdx = index;
    this._startPath();
  } else {
    this.target = null;
    this.pathNextIdx = 0;
  }
};

Agent.prototype._startPath = function() {
  this.joints = this.path.getJoints();
  if (this.group.isPathReverse()) {
    this.target = this.joints[this.pathStartIdx];
    this.pathNextIdx = this.pathStartIdx - 1;
  } else {
    this.target = this.joints[this.pathStartIdx];
    this.pathNextIdx = this.pathStartIdx + 1;
  }
};

Agent.prototype.step = function(stepSize) {
  var accel = this.group.behavior.getAccel(this, this.target);

  if (this.debug) {
    if (accel && (isNaN(accel[0]) || isNaN(accel[1]))) {
      throw 'Agent pos invalid';
    }
  }

  this.move(accel, stepSize);
  // update target to next if arrive at current
  var last = false;
  if (this.target) {
    if (this.pathNextIdx >= -1 && this.target.in(this.pos)) {
      if (this.group.isPathReverse()) {
        if (this.pathNextIdx >= 0) {
          // follow to next waypoint
          this.target = this.joints[this.pathNextIdx--];
        } else {
          last = true;
        }
      } else {
        if (this.pathNextIdx < this.joints.length) {
          // follow to next waypoint
          this.target = this.joints[this.pathNextIdx++];
        } else {
          last = true;
        }
      }
      if (last) { // last point check if is a circular path or end in endContext
        if (this.group.isPathCircular()) {
          this._startPath();
        } else { // do one last trip for symetry to endContext if exists for symetry
          var endContext = this.group.getEndContext();
          if (endContext) {
            this.setTargetInContext(endContext);
          }
        }
      }
    }
  }
};

Agent.prototype.move = function(accel, stepSize) {
  Vec2.scaleAndAdd(this.vel, this.vel, accel, stepSize);
  if (Vec2.length(this.vel) > this.maxVel) {
    Vec2.normalizeAndScale(this.vel, this.vel, this.maxVel);
  }
  Vec2.scaleAndAdd(this.pos, this.pos, this.vel, stepSize * this.currentMobility);

  this.currentMobility = this.mobility; // restore mobility for next step reduced by contexts
};

Agent.defaults = {
  aspect: 0xFFFFFF, // used for coloring
  debug: false,
  size: 0.5,
  mass: 80e3,
  mobility: 1.0,
  maxAccel: 0.5, // m/s^2
  maxVel: 1 // m/seg
};
Agent.id = 0;
Agent.type = 'agent';

module.exports = Agent;

},{"./Common/Vec2":5}],2:[function(require,module,exports){
'use strict';

/**
 *
 *
 * @param  {World} world [description]
 * @param  {Object} options [description]
 * {Vec2}       [description]
 */
var Behavior = function(world) {
  this.world = world;
};

// path point, point, other agent {point , radius}
Behavior.prototype.getAccel = function(agent, target) {};

module.exports = Behavior;

},{}],3:[function(require,module,exports){
'use strict';

var Vec2 = require('../Common/Vec2');
var Behavior = require('./Behavior');

/**
 * Helbing-Farkas,Vicsek Simulating dynamical features of escape panic
 *
 * @param  {World} world [description]
 * @param  {Object} options [description]
 * {Vec2}       [description]
 */
var Panic = function(world, options) {
  Behavior.call(this, world);
  this.options = Lazy(options).defaults(Panic.defaults).toObject();
};

// path point, point, other agent {point , with in. function}
Panic.prototype.getAccel = function(agent, target) {
  Behavior.prototype.getAccel.call(this, agent, target);
  var desiredForce = Vec2.create();
  var agentsForce = Vec2.create();
  var wallsForce = Vec2.create();
  var accel = Vec2.create();
  var arrived;

  // check agent desired force
  Vec2.add(accel, agentsForce, wallsForce);
  if (target) { // agent is going somewhere?
    arrived = target.in(agent.pos);
    if (!arrived) {
      Vec2.subtract(desiredForce, target.pos, agent.pos);
      if (Vec2.length(desiredForce) > agent.maxAccel) {
        Vec2.normalizeAndScale(desiredForce, desiredForce, agent.maxAccel * agent.mass);
      }
    }
  }

  // check other agents interaction
  var neighbours = this.world.getNearAgents(agent);
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
      for (var s = 0; s < wall.getJoints().length - 1; s++) { // check each segment of wall
        var projection = wall.getProjection(agent.pos, s);
        var wallsToAgentForce = this.calculateWallForce(agent, projection, wall.getWidth());
        Vec2.add(wallsForce, wallsForce, wallsToAgentForce);
      }
    }
  }

  // fix to stay in place if no target is selected or already at target
  if (!target || arrived) {
    Vec2.negate(desiredForce, agent.vel);
    Vec2.scale(desiredForce, desiredForce, this.options.relaxationTime);
    if (Vec2.length(desiredForce) > agent.maxAccel) {
      Vec2.normalizeAndScale(desiredForce, desiredForce, agent.maxAccel);
    }
  }

  Vec2.add3(accel, desiredForce, agentsForce, wallsForce);
  // return desiredForce + agentsForce + wallsForce;
  if (agent.debug) {
    if (isNaN(desiredForce[0]) || isNaN(agentsForce[0]) || isNaN(wallsForce[0]) ||
        isNaN(desiredForce[1]) || isNaN(agentsForce[1]) || isNaN(wallsForce[1])) {
      throw 'One of the forces is a NaN!';
    }
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

Panic.defaults = {
  A: 2e3, // N
  B: 0.08, // m
  kn: 1.2e5, // kg s-2
  Kv: 2.4e5, //kg m-1 s-1
  relaxationTime: 0.3
};
module.exports = Panic;

},{"../Common/Vec2":5,"./Behavior":2}],4:[function(require,module,exports){
'use strict';

var Vec2 = require('./Vec2');

var Grid = function(near) {
  this.near = near;
  this.grid = {};
};

Grid.prototype.insert = function(entities) {
  for (var i in entities) {
    var entity = entities[i];
    var key = this._key(entity);
    if (this.grid.hasOwnProperty(key)) {
      this.grid[key].push(entity);
    } else {
      this.grid[key] = [entity];
    }
  }
};

Grid.prototype.insertOne = function(entity, x, y) {
  var key = this._key(entity, x, y);
  if (this.grid.hasOwnProperty(key)) {
    this.grid[key].push(entity);
  } else {
    this.grid[key] = [entity];
  }
};

Grid.prototype.updateContextsHelper = function(contexts) {
  this.grid = {};
  for (var i in contexts) {
    var context = contexts[i];
    var init = context.getMinXY();
    var end = context.getMaxXY();
    // generate samples from context to insert into grid
    for (var x = init[0]; x <= end[0]; x += this.near) {
      for (var y = init[1]; y <= end[1]; y += this.near) {
        this.insertOne(context, x, y);
      }
    }
  }
};

Grid.prototype.updateWallsHelper = function(walls) {
  this.grid = {};
  for (var w in walls) {
    var wall = walls[w];
    var joints = wall.getJoints();
    if (joints.length > 0) {
      var point = Vec2.create();
      var squareStep = 2 * this.near * this.near; // sample step to ensure that line cross region at least half square
      for (var j = 1; j < joints.length; j++) {
        var squaredDistance = Vec2.squaredDistance(joints[j - 1].pos, joints[j].pos);
        var samples = Math.floor(squaredDistance / squareStep);
        for (var s = 0; s < samples; s++) {
          // generate sample of segment
          Vec2.lerp(point, joints[j - 1].pos, joints[j].pos, s / samples);
          this.insertOne(wall, point[0], point[1]);
        }
      }
    }
  }
};

Grid.prototype.remove = function(entities) {
  for (var i in entity) {
    var entity = entities[i];
    var key = this._key(entity);
    var bucket = this.grid[key];
    var j = bucket.indexOf(entity);
    this.grid[key].splice(j, 1);
  }
};

Grid.prototype.updateAll = function(entities) {
  this.clear();
  this.insert(entities);
};

Grid.prototype.update = function(entities) {
  this.remove(entities);
  this.insert(entities);
};

Grid.prototype.clear = function() {
  this.grid = {};
};

Grid.prototype.neighbours = function(entity, x, y) {
  var that = this;
  var o = this.near / 2;
  x = x || entity.pos[0];
  y = y || entity.pos[1];
  var keys = this._keyNeighbours(x, y);
  // find neighbours in hashmap looking in all buckets and filtering empty or duplicates
  return Lazy(keys).map(function(key) {
    return that.grid[key];
  }).flatten().filter(function(e) { return e;});
};

Grid.prototype.neighboursContext = function(context) {
  // generate sampling and find entities near
  var init = context.getMinXY();
  var end = context.getMaxXY();
  var neighbours = Lazy([]);
  for (var x = init[0]; x < end[0]; x += this.near) {
    for (var y = init[1]; y < end[1]; y += this.near) {
      neighbours = neighbours.concat(this.neighbours(null, x, y));
    }
  }
  return neighbours.flatten();
};

Grid.prototype._keyNeighbours = function(x, y) {
  x = Math.floor(x / this.near) * this.near;
  y = Math.floor(y / this.near) * this.near;
  return [
    (x - 1) + ':' + (y + 1), x + ':' + (y + 1), (x + 1) + ':' + (y + 1),
    (x - 1) + ':' + y      , x + ':' + y      , (x + 1) + ':' + y,
    (x - 1) + ':' + (y - 1), x + ':' + (y - 1), (x + 1) + ':' + (y - 1)
  ];
};

Grid.prototype._key = function(entity, x, y) {
  // use x,y if available if not just entity position
  x = x || entity.pos[0];
  x = Math.floor(x / this.near) * this.near;
  y = y || entity.pos[1];
  y = Math.floor(y / this.near) * this.near;
  return x + ':' + y;
};

module.exports = Grid;

},{"./Vec2":5}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
'use strict';

//var $ = jQuery =

var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.settings = Lazy(options).defaults(Engine.defaults).toObject();
  this.callbacks = this.settings.callbacks;
  delete this.settings.callbacks;
};

Engine.prototype.getSettings = function() {
  return this.settings;
};

Engine.prototype.setWorld = function(world) {
  this.world = world;
};

Engine.prototype.getWorld = function() {
  return this.world;
};

Engine.prototype.run = function(entity) {
  if (this.running) {
    return;
  }
  this.running = true;
  this.world.freeze(false);
  if (this.callbacks.onStart) {
    this.callbacks.onStart(entity);
  }
  this._step();
  return this.running;
};

Engine.prototype.step = function() {
  if (this.running) {
    this.stop();
  }
  this._step();
  return this.running;
};

Engine.prototype._step = function() {
  // calculate next execution
  var startTime = new Date();
  var opts = this.settings;
  var timeStepSize = opts.timeStepSize;

  var entity = this.world.step(timeStepSize); // returns entity that request stop a contexts
  this.iterations++;
  if (this.callbacks.onStep) {
    this.callbacks.onStep(this.world);
  }
  // entity requests stop of simulation
  if (entity) {
    this.stop(entity);
  }

  if (this.running) {
    var that = this;
    // using setTimeout instead of setInterval allows dinamycally changing timeStep while running
    var endTime = new Date();
    var timeToWait = (opts.timeStepRun * 1000) - (endTime - startTime);
    timeToWait = timeToWait > 0 ? timeToWait : 0;
    setTimeout(function() {
      that._step();
    }, timeToWait);
  }
};

Engine.prototype.stop = function(entity) {
  if (!this.running) {
    return;
  }
  this.world.freeze(true);
  this.running = false;
  if (this.callbacks.onStop) {
    this.callbacks.onStop(entity);
  }
  return this.running;
};

Engine.prototype.reset = function() {
  var groups = this.world.getGroups();
  Lazy(groups).each(function(g) {
    g.emptyAgents();
  });
  this.stop();
  this.iterations = 0;
  return this.running;
};

Engine.defaults = {
  timeStepSize: 0.05,
  timeStepRun: 0.01,
  callbacks: {
    onStart: null,
    onStep: null,
    onStop: null
  }
};

module.exports = Engine;

},{}],7:[function(require,module,exports){

var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');
var AssignableToGroup = require('./Helpers/Traits').AssignableToGroup;

var Context = function(x, y, parent, options, id) {
  this.options = Lazy(options).defaults(Context.defaults).toObject();
  this.id = id || 'C' + Context.id++;
  Context.id = Entity.prototype.calcNewId.call(this, Context.id);
  Entity.call(this, x, y, parent, this.options);
};

Context.prototype.destroy = function() {
  Entity.prototype.destroy.call(this);
};

Context.prototype.setArea = function(x, y) {
  this.options.width = Math.abs(this.pos[0] - x) * 2;
  this.options.height = Math.abs(this.pos[1] - y) * 2;
};

Context.prototype.incrSize = function(ds) {
  this.options.width += ds;
  this.options.height += ds;
};

Context.prototype.getWidth = function() {
  return this.options.width;
};

Context.prototype.getHeight = function() {
  return this.options.height;
};

Context.prototype.getMinXY = function() {
  var point = Vec2.create();
  var halfSize = Vec2.fromValues(this.options.width / 2, this.options.height / 2);
  return Vec2.subtract(point, this.pos, halfSize);
};

Context.prototype.getMaxXY = function() {
  var point = Vec2.create();
  var halfSize = Vec2.fromValues(this.options.width / 2, this.options.height / 2);
  return Vec2.add(point, this.pos, halfSize);
};

Context.prototype.getRandomPoint = function() {
  var x = this.pos[0] + (Math.random() - 0.5) * this.options.width;
  var y = this.pos[1] + (Math.random() - 0.5) * this.options.height;
  return Vec2.fromValues(x, y);
};

Context.prototype.getNearestPoint = function(point, border) {
  var w2 = this.options.width / 2 - this.options.width / 10; // half-width + 10% margin to avoid borders errors
  var h2 = this.options.height / 2 - this.options.height / 10;
  // all segments
  var corners = [[this.pos[0] - w2, this.pos[1] - h2], [this.pos[0] + w2, this.pos[1] - h2],
                 [this.pos[0] + w2, this.pos[1] + h2], [this.pos[0] - w2, this.pos[1] + h2],
                 [this.pos[0] - w2, this.pos[1] - h2]];
  var nearestPoint = this.pos;
  var projection = Vec2.create();
  // find shortest linear path
  var shortestProjection = Vec2.fromValues(point[0] - this.pos[0], point[1] - this.pos[1]);
  var shortestProjectionDistance = Vec2.squaredLength(shortestProjection);
  for (var c = 1; c < corners.length; c++) {
    projection = Vec2.projectionToSegment(projection, point, corners[c - 1], corners[c]);
    var distance = Vec2.squaredLength(projection);
    if (distance < shortestProjectionDistance) {
      shortestProjection = projection;
      shortestProjectionDistance = distance;
    }
  }
  return Vec2.subtract(shortestProjection,point,shortestProjection);
};

Context.prototype.getMobility = function() {
  return this.options.mobility;
};

Context.prototype.getTrigger = function() {
  return this.options.triggerOnEmpty;
};

Context.prototype.in = function(pos) {
  var w2 = this.options.width / 2;
  var h2 = this.options.height / 2;
  var isIn = (this.pos[0] - w2 < pos[0] && pos[0] < this.pos[0] + w2) &&
             (this.pos[1] - h2 < pos[1] && pos[1] < this.pos[1] + h2);
  return isIn;
};

Context.type = 'context';
Context = AssignableToGroup(Context);

Context.defaults = {
  mobility: 1,
  triggerOnEmpty: false,
  width: 10,
  height: 10
};
Context.id = 0;
module.exports = Context;

},{"../Common/Vec2":5,"./Entity":8,"./Helpers/Traits":12}],8:[function(require,module,exports){
var Vec2 = require('../Common/Vec2');

var Entity = function(x, y, parent, options) {
  this.extra = {}; // for extra information, e.g. render object
  this.pos = Vec2.fromValues(x, y);
  this.entities = {}; // stores diferent structures with related entities
  this.children = {}; // stores children entities
  this.view = null; // to store references to render objects
  if (parent) {
    this.parent = parent;
    // request add to parent the entity
    this.parent.addEntity(this, options);
  }
};

Entity.prototype.calcNewId = function(id) {
  return Math.max(id + 1, Number(this.id.substring(1)) + 1);
};

Entity.prototype.destroy = function() {
  if (this.parent) {
    // request to parent removal of entity
    this.parent.removeEntity(this);
  }
};

Entity.prototype.updatePos = function(x, y) {
  this.pos[0] = x;
  this.pos[1] = y;
};

// To add a children entity
Entity.prototype.addEntity = function(joint) {};

// To request remove of a children entity
Entity.prototype.removeEntity = function(joint) {};

module.exports = Entity;

},{"../Common/Vec2":5}],9:[function(require,module,exports){
'use strict';

var Entity = require('./Entity');
var Context = require('./Context');
var Path = require('./Path');
var Agent = require('../Agent');
var Vec2 = require('../Common/Vec2');
var Grid = require('../Common/Grid');
var Panic = require('../Behavior/Panic');

var Group = function(x, y, parent, options, id) {
  this.options = Lazy(options).defaults(Group.defaults).toObject();
  this.id = id || 'G' + Group.id;
  Group.id = Entity.prototype.calcNewId.call(this, Group.id);
  Entity.call(this, x, y, parent, this.options);
  this.behavior = new Panic(this.parent);
  this.agents = [];
  this.agentsCount = this.options.agentsCount;
  this.entities.path = null;
  this.entities.startContext = null;
  this.entities.endContext = null;
};

Group.prototype.destroy = function() {
  this.emptyAgents();
  this.behavior = null;
  if (this.entities.startContext) {
    this.entities.startContext.unassignFromGroup(this);
  }
  if (this.entities.endContext) {
    this.entities.endContext.unassignFromGroup(this);
  }
  Entity.prototype.destroy.call(this);
};

Group.prototype.getRadius = function() {
  return this.options.radius;
};
Group.prototype.setRadius = function(radius) {
  this.options.radius = radius;
};
Group.prototype.incrRadius = function(dr) {
  this.options.radius = Math.abs(this.options.radius + dr);
};

Group.prototype.getStartContext = function() {
  return this.entities.startContext;
};

Group.prototype.assignStartContext = function(context) {
  if (this.entities.startContext) {
    this.entities.startContext.unassignFromGroup(this);
  }
  if (context) {
    context.assignToGroup(this);
  }
  this.entities.startContext = context;
};

Group.prototype.getEndContext = function() {
  return this.entities.endContext;
};

Group.prototype.assignEndContext = function(context) {
  if (this.entities.endContext) {
    this.entities.endContext.unassignFromGroup(this);
  }
  if (context) {
    context.assignToGroup(this);
  }
  this.entities.endContext = context;
};

Group.prototype.assignPath = function(path, idx) {
  if (this.entities.path) {
    this.entities.path.unassignFromGroup(this);
  }
  this.options.pathStart = idx || 0;
  this.entities.path = path;
  if (path) {
    path.assignToGroup(this);
    for (var i  in this.agents) {
      this.agents[i].followPath(path, this.options.pathStart);
    }
  }
};

Group.prototype.isPathReverse = function() {
  return this.options.pathReverse;
};

Group.prototype.isPathCircular = function() {
  return this.options.pathCircular;
};

Group.prototype.getPathStartIdx = function() {
  return this.options.pathStart;
};

Group.prototype.unAssign = function(entity) {
  if (entity instanceof Context) {
    if (this.entities.startContext === entity) {
      this.entities.startContext = null;
      entity.unassignFromGroup(this);
    }
    if (this.entities.endContext === entity) {
      this.entities.endContext = null;
      entity.unassignFromGroup(this);
    }
  } else if (entity instanceof Path) {
    this.entities.path = null;
    entity.unassignFromGroup(this);
  } else {
    throw 'Entity not assigned to group';
  }
};

Group.prototype.assignBehavior = function(behavior) {
  this.behavior = behavior;
};

Group.prototype.generateAgents = function(agentsCount, startContext) {
  if (!startContext) {
    startContext = this.entities.startContext;
  }
  // functions to set initial position
  var newAgents = [];
  var opts = this.options;
  var pos = Vec2.create();
  var radius = this.options.radius;
  var initPos = this.pos;
  function myInitPos(pos) {
    var r = Math.random() * radius;
    Vec2.random(pos, r);
    Vec2.add(pos, pos, initPos);
    return pos;
  }
  function myContextPos() {
    return startContext.getRandomPoint();
  }
  var getInitPos = startContext ? myContextPos : myInitPos;
  var numberToGenerate = Math.min(agentsCount, this.options.agentsMax);
  // agent generation
  for (var i = 0; i < numberToGenerate; i++) {
    pos = getInitPos(pos);
    var size = opts.agentsSizeMin;
    if (opts.agentsSizeMin !== opts.agentsSizeMax) {
      // random uniform distribution
      size = opts.agentsSizeMin + Math.random() * (opts.agentsSizeMax - opts.agentsSizeMin);
    }
    var agent = new Agent(pos[0], pos[1], this, {
      size: size,
      debug: opts.debug,
      path: this.entities.path,
      aspect: this.options.agentsAspect || Math.round(Math.random() * 0xFFFFFF),
      pathStart: this.options.pathStart
    });
    //agent.followPath(this.entities.path, this.options.startIdx);
    //agent.assignBehavior(behavior);
    newAgents.push(agent);
  }
  return newAgents;
};

Group.prototype.addAgents = function(agentsCount) {
  var newAgents = this.generateAgents(agentsCount);
  this.agents = this.agents.concat(newAgents);
  this.parent.addAgents(newAgents);
};

Group.prototype.emptyAgents = function() {
  this.parent.removeAgents(this.agents);
  this.agents.length = 0;
};

Group.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.agents.indexOf(agents[i]);
    this.agents.splice(j, 1);
  }
  this.parent.removeAgents(agents);
};

Group.prototype.getPath = function() {
  return this.entities.path;
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

Group.prototype.in = function(pos) {
  return Vec2.squaredDistance(pos, this) < this.options.radius * this.options.radius;
};

Group.prototype.addAgent = function(agent) {
  this.agents.push(agent);
};

Group.prototype.step = function() {
  if (this.agents.length === 0) {
    this.addAgents(this.options.agentsCount);
  }

  // generate agents in startContext based on uniform distribution
  if (this.options.startRate > 0 && this.options.startProb > 0 && this.agents.length < this.options.agentsMax) {
    var probBirth = Math.random();
    if (probBirth < this.options.startProb) {
      var rate = this.options.startRate ;
      if (rate + this.agents.length > this.options.agentsMax) {
        // limit maximun agents
        rate = this.options.agentsMax;
      }
      this.addAgents(rate);
    }
  }
  // destroy nth-first agents in endContext based on uniform distribution
  if (this.entities.endContext && this.options.endRate > 0 && this.options.endProb > 0) {
    var probDie = Math.random();
    if (probDie < this.options.endProb) {
      var endContext = this.entities.endContext;
      var agentsOut = Lazy(this.agents).filter(function(agent) {
          return endContext.in(agent.pos);
        })
        .first(this.options.endRate).toArray();
      this.removeAgents(agentsOut);
    }
  }
};

Group.defaults = {
  agentsAspect: 0, // used for colors
  agentsSizeMin: 0.5,
  agentsSizeMax: 0.5,
  agentsCount: 10,
  agentsMax: 100,
  debug: false,
  pathStart: 0,
  pathReverse: false,
  pathCircular: false,
  radius: 3, // used when no start context is associated
  startProb: 0, // Adds agents per step in startContext
  startRate: 0, // Adds agents probability per step in startContext
  endProb: 0, // Removes agents per step in endContext
  endRate: 0, // Removes agents probability per step in endContext
  near: 10 // hasmap grid size for endContext checks
};
Group.id = 0;
Group.type = 'group';

module.exports = Group;

},{"../Agent":1,"../Behavior/Panic":3,"../Common/Grid":4,"../Common/Vec2":5,"./Context":7,"./Entity":8,"./Path":13}],10:[function(require,module,exports){
var Entity = require('../Entity');
var Vec2 = require('../../Common/Vec2');

var Joint = function(x, y, parent, options, id) {
  this.options = Lazy(options).defaults(Joint.defaults).toObject();
  Entity.call(this, x, y, parent, this.options);
  delete this.options.previousJoint; // delete not neccesary
  this.id = id || 'J' + Joint.id++;
  Joint.id = Entity.prototype.calcNewId.call(this, Joint.id);
};

Joint.prototype.destroy = function() {
  if (this.parent) {
    this.parent.removeEntity(this);
  }
};

Joint.prototype.getRadius = function() {
  return this.options.radius;
};

Joint.prototype.in = function(pos) {
  var dist = Vec2.distance(pos, this.pos);
  return dist < this.options.radius;
};

Joint.prototype.setRadius = function(radius) {
  if (this.options.scalable) {
    this.options.radius = radius;
  }
};

Joint.prototype.incrRadius = function(dr) {
  if (this.options.scalable) {
    this.options.radius = Math.abs(this.options.radius + dr);
  }
};

Joint.defaults = {
  radius: 4,
  previousJoint: null,
  scalable: true
};
Joint.id = 0;
Joint.type = 'joint';

module.exports = Joint;

},{"../../Common/Vec2":5,"../Entity":8}],11:[function(require,module,exports){
'use strict';

var Vec2 = require('../../Common/Vec2');
var Entity = require('../Entity');
var Joint = require('./Joint');

var LinePrototype = function(idPrefix, type, defaults, id) {
  var Line = function(x, y, parent, options, id) {
    this.options = Lazy(options).defaults(defaults).toObject();
    this.id = id || idPrefix + Line.id++;
    Line.id = Entity.prototype.calcNewId.call(this, Line.id);
    Entity.call(this, x, y, parent, this.options);
    this.children.joints = [];
    if (x && y) {
      this.addJoint(x,y,this.options);
    }
  };

  Line.prototype.destroy = function() {
    for (var j in this.children.joints) {
      this.children.joints[j].parent = null;
      this.children.joints[j].destroy();
    }
    this.children.joints.length = 0;
    Entity.prototype.destroy.call(this);
  };

  Line.prototype.addEntity = function(joint, options) {
    // add a joint to the end or a given position by options.idx
    if (!options || options.previousJoint === null) {
      this.children.joints.push(joint);
    } else {
      var idx = this.children.joints.indexOf(options.previousJoint);
      if (idx === -1) { throw 'Previous joint not found'; }
      if (idx !== 0) { // add end
        idx++;
      }
      this.children.joints.splice(idx, 0, joint);
    }
  };

  Line.prototype.removeEntity = function(joint) {
    var idx = this.children.joints.indexOf(joint);
    if (idx !== -1) {
      this.children.joints.splice(idx, 1);
      // destroy line if not contains joints
      if (this.children.joints.length === 0) {
        this.destroy();
      } else if (idx === 0 && this.children.joints.length !== 0) { // relocate reference to next joint idx +1,
        //but we removed idx alreade so next is idx
        var nextJoint = this.children.joints[idx];
        this.pos[0] = nextJoint.pos[0];
        this.pos[1] = nextJoint.pos[1];
      }
    } else {
      throw 'Joint not found in ' + Line.type;
    }
  };

  Line.prototype.addJoints = function(joints) {
    // n joints, n-1 sections
    for (var i in joints) {
      var joint = joints[i];
      var radius = this.options.radius;
      var options = Lazy(options).defaults(defaults).toObject();
      if (joint.length === 2) {
        options.radius = joint[3];
      }
      this.addJoint(joint[0],joint[1],options);
    }
  };

  Line.prototype.addJoint = function(x, y, options, id) {
    Entity.prototype.updatePos.call(this,x,y);
    options = Lazy(options).defaults(defaults).toObject();
    var joint = new Joint(x, y, this, options, id);
    return joint;
  };

  Line.prototype.getJoints = function() {
    return this.children.joints;
  };

  Line.prototype.getJointIdx = function(joint) {
    return this.children.joints.indexOf(joint);
  };

  Line.prototype.getJointByIdx = function(idx) {
    return this.children.joints[idx];
  };

  Line.prototype.getWidth = function() {
    return this.options.width;
  };

  Line.prototype.reverse = function() {
    this.children.joints = Lazy(this.children.joints).reverse().toArray();
  };

  Line.prototype.getProjection = function(point, segment) {
    if (segment < 0 || segment >= this.children.joints.length - 1) {
      throw 'Segment out of bounds';
    }
    var projection = Vec2.create();
    return Vec2.projectionToSegment(projection, point, this.children.joints[segment].pos, this.children.joints[segment + 1].pos);
  };

  Line.id = 0;
  Line.type = type;
  return Line;
};

module.exports = LinePrototype;

},{"../../Common/Vec2":5,"../Entity":8,"./Joint":10}],12:[function(require,module,exports){


var AssignableToGroup = function(EntityPrototype) {

  var oldConstruct = EntityPrototype.prototype;
  var oldDestroy = EntityPrototype.prototype.destroy;

  EntityPrototype = function(x, y, parent, options, id) {
    oldConstruct.constructor.call(this,x, y, parent, options, id);
    this.entities.groups = [];
  };
  EntityPrototype.prototype = oldConstruct;

  EntityPrototype.prototype.destroy = function() {
    // additionally unAssignFromGroup
    for (var g in this.entities.groups) {
      this.entities.groups[g].unAssign(this);
    }
    this.entities.groups.length = 0;
    // call original destroy
    return oldDestroy.call(this);
  };

  EntityPrototype.prototype.assignToGroup = function(entity) {
    var idx = this.entities.groups.indexOf(entity);
    if (idx > -1) {
      throw 'Entity already associated';
    } else {
      this.entities.groups.push(entity);
    }
  };

  EntityPrototype.prototype.unassignFromGroup = function(group) {
    var idx = this.entities.groups.indexOf(group);
    if (idx > -1) {
      this.entities.groups.splice(idx, 1);
    } else {
      throw 'Entity not associated';
    }
  };

  EntityPrototype.prototype.getAssignedGroups = function() {
    return this.entities.groups;
  };

  return EntityPrototype;
};

module.exports.AssignableToGroup = AssignableToGroup;

},{}],13:[function(require,module,exports){
'use strict';

var LinePrototype = require('./Helpers/LinePrototype');
var AssignableToGroup = require('./Helpers/Traits').AssignableToGroup;

var Path = LinePrototype('P','path',{
  width: 0.2,
  radius: 4
});

Path.defaults = {
  width: 0.2,
  radius: 4
};
Path.id = 0;
Path = AssignableToGroup(Path);
module.exports = Path;

},{"./Helpers/LinePrototype":11,"./Helpers/Traits":12}],14:[function(require,module,exports){


var LinePrototype = require('./Helpers/LinePrototype');

var Wall = LinePrototype('W','wall',{
  width: 0.2,
  radius: 1,
  scalable: false
});
Wall.id = 0;

module.exports = Wall;

},{"./Helpers/LinePrototype":11}],15:[function(require,module,exports){
'use strict';

var Context = require('./Entities/Context');
var Group = require('./Entities/Group');
var Path = require('./Entities/Path');
var Wall = require('./Entities/Wall');
var Grid = require('./Common/Grid');

var World = function(parent, options) {
  this.options = Lazy(options).defaults(World.defaults).toObject();
  var that = this;
  this.parent = parent;
  this.agents = [];

  this.entities = {
    contexts: [],
    groups: [],
    paths: [],
    walls: []
  };
  this.grid = new Grid(this.options.near);
  this.gridWalls = new Grid(this.options.near);
  this.gridContexts = new Grid(this.options.near);
  this.changes = 1;
  this.isFrozen = true;
};

World.prototype.getDefaultGroup = function() {
  return this.entities.groups[0];
};

World.prototype.getAgents = function() {
  return this.agents;
};

World.prototype.getEntitiesIterator = function() {
  return Lazy(this.entities).values().flatten();
};

World.prototype.getContexts = function() {
  return this.entities.contexts;
};

World.prototype.getGroups = function() {
  return this.entities.groups;
};

World.prototype.getPaths = function() {
  return this.entities.paths;
};

World.prototype.getWalls = function() {
  return this.entities.walls;
};

World.prototype.addAgents = function(agents) {
  this.agents = this.agents.concat(agents);
  this.grid.insert(agents);
  if (this.options.onCreateAgents) {
    this.options.onCreateAgents(agents);
  }
};

World.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.agents.indexOf(agents[i]);
    this.agents.splice(j, 1);
  }
  this.grid.remove(agents);
  if (this.options.onDestroyAgents) {
    this.options.onDestroyAgents(agents);
  }
};

World.prototype._onCreate = function(entity) {
  if (this.options.onCreateEntity) {
    this.options.onCreateEntity(entity);
  }
};

World.prototype._onDestroy = function(entity) {
  if (this.options.onDestroyEntity) {
    this.options.onDestroyEntity(entity);
  }
};

World.prototype._getEntityList = function(entity) {
  if (entity instanceof Context) { // is context
    return this.entities.contexts;
  } else if (entity instanceof Group) { // is group
    return this.entities.groups;
  } else if (entity instanceof Path) { // is path
    return this.entities.paths;
  } else if (entity instanceof Wall) { // is wall
    return this.entities.walls;
  } else {
    throw 'Entity object is not context, group, wall or path';
  }
};

World.prototype.removeEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  var idx = entityList.indexOf(entity);
  if (idx !== -1) {
    entityList.splice(idx, 1);
    this._onDestroy(entity);
    this.changes++;
  }
};

World.prototype.addEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  entityList.push(entity);
  this._onCreate(entity);
  this.changes++;
};

World.prototype.addContext = function(context) {
  this.entities.contexts.push(context);
  this._onCreate(context);
};

World.prototype.addGroup = function(group) {
  this.entities.groups.push(group);
  this._onCreate(group);
};

World.prototype.addPath = function(path) {
  this.entities.paths.push(path);
  this._onCreate(path);
};

World.prototype.addWall = function(wall) {
  this.entities.walls.push(wall);
  this._onCreate(wall);
};

World.prototype.getEntityById = function(id) {
  return Lazy(this.entities).values().flatten().findWhere({id: id});
};

World.prototype.getContextById = function(id) {
  return Lazy(this.entities.contexts).findWhere({id: id});
};

World.prototype.getPathById = function(id) {
  return Lazy(this.entities.paths).findWhere({id: id});
};

World.prototype.getNearAgents = function(agent) {
  return this.grid.neighbours(agent).toArray();
};

World.prototype.getNearWalls = function(agent) {
  return this.gridWalls.neighbours(agent).uniq().toArray();
};

World.prototype.agentsInContext = function(context) {
  return this.grid.neighboursContext(context).filter(function(agent) {
    return context.in(agent.pos);
  }).toArray();
};

World.prototype._saveHelper = function(o) {
  var ignore = ['view', 'extra', 'agents', 'parent', 'world'];
  var cache = [];
  var result = JSON.stringify(o, function(key, value) {
    if (ignore.indexOf(key) !== -1) { return; }
    if (key === 'entities') {
      var entities = {};
      // map entities to array of ids
      for (var prop in value) {
        entities[prop] = value[prop] ? value[prop].id : null;
      }
      return entities;
    }
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        throw 'Circular reference found!';
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  }, 2);
  return result;
};

World.prototype.save = function(save) {
  var raw = this._saveHelper(this.entities);
  if (save) {
    this.entitiesSave = raw;
  } else {
    console.log(raw);
    return raw;
  }
};

World.prototype.load = function(loader, loadDefault) {
  if (!loader) {
    // snapshoot load
    if (loadDefault && this.entitiesSave) {
      loader = this.entitiesSave;
    } else {
      return;
    }
  }

  if (typeof(loader) === 'function') {
    // try function loader
    loader(this);
  } else {
    // loader of raw JSON strings
    if (typeof(loader) === 'string') {
      loader = JSON.parse(loader);
    }
    var world = this;
    // check if its json data
    // entites are arred to world passing its reference

    Lazy(loader.walls).each(function(e) {
      var joints = e.children.joints;
      var pos = e.children.joints ? [null, null] : e.pos; // to avoid duplicate init
      var wall = new Wall(pos[0], pos[1], world, e.options, e.id);
      Lazy(joints).each(function(j) {
        wall.addJoint(j.pos[0], j.pos[1], j.options, j.id);
      });
    });
    Lazy(loader.paths).each(function(e) {
      var joints = e.children.joints;
      var pos = e.children.joints ? [null, null] : e.pos; // to avoid duplicates init
      var path = new Path(pos[0], pos[1], world, e.options, e.id);
      Lazy(joints).each(function(j) {
        path.addJoint(j.pos[0], j.pos[1], j.options, j.id);
      });
    });
    Lazy(loader.contexts).each(function(e) {
      new Context(e.pos[0], e.pos[1], world, e.options, e.id);
    });
    Lazy(loader.groups).each(function(e) {
      var g = new Group(e.pos[0], e.pos[1], world, e.options, e.id);
      if (e.entities.startContext) {
        var startContext = world.getContextById(e.entities.startContext);
        g.assignStartContext(startContext);
      }
      if (e.entities.endContext) {
        var endContext = world.getContextById(e.entities.endContext);
        g.assignEndContext(endContext);
      }
      if (e.entities.path) {
        var path = world.getPathById(e.entities.path);
        g.assignPath(path, g.options.pathStart);
      }
    });
  }
  this.changes++;
};

World.prototype.step = function(stepSize) {
  var that = this;
  this.grid.updateAll(this.agents);
  this.gridWalls.updateWallsHelper(this.entities.walls);
  this.gridContexts.updateContextsHelper(this.entities.contexts);

  // check contexts interaction reducing speed or life of agents
  Lazy(this.entities.contexts).filter(function(c) {return c.getMobility() < 1;}).each(function(context) {
    var agents = that.agentsInContext(context, that.agents);
    if (agents.length > 0) {
      Lazy(agents).each(function(agent) {
        agent.setCurrentMobility(context.getMobility());
      });
    }
  });

  Lazy(this.agents).each(function(agent) {
    agent.step(stepSize);
  });

  Lazy(this.entities.groups).each(function(group) {
    group.step(stepSize);
  });

  // check contexts that triggers stop on empty
  var contextEmpty = null;
  Lazy(this.entities.contexts).filter(function(c) {return c.getTrigger();}).each(function(context) {
    var agents = that.agentsInContext(context, that.agents);
    if (agents.length === 0) {
      contextEmpty = context; // to inform engine of stop source
    }
  });
  this.changes++;
  return contextEmpty;
};

World.prototype.changesNumber = function() {
  var changes = this.changes;
  this.changes = 0;
  return changes;
};
World.prototype.freeze = function(freeze) {
  this.isFrozen = freeze || this.isFrozen;
  return this.isFrozen;
};

World.defaults = {
  near: 10, // grid of 3x3 squares of 2 meters
  width: null,
  height: null,
  onCreateAgents: null,
  onDestroyAgents: null,
  onCreateEntity: null,
  onDestroyEntity: null
};
module.exports = World;

},{"./Common/Grid":4,"./Entities/Context":7,"./Entities/Group":9,"./Entities/Path":13,"./Entities/Wall":14}],"CrowdSim":[function(require,module,exports){
/* global window,module, exports : true, define */

var CrowdSim = {
  Agent: require('./Agent'),
  Entity: require('./Entities/Entity'),
  Context: require('./Entities/Context'),
  Wall: require('./Entities/Wall'),
  Path: require('./Entities/Path'),
  Group: require('./Entities/Group'),
  Joint: require('./Entities/Helpers/Joint'),
  World: require('./World'),
  Engine: require('./Engine'),
  Vec2: require('./Common/Vec2')
};

CrowdSim.restartIds = function() {
  CrowdSim.Agent.id = 0;
  CrowdSim.Context.id = 0;
  CrowdSim.Group.id = 0;
  CrowdSim.Path.id = 0;
  CrowdSim.Wall.id = 0;
  CrowdSim.Joint.id = 0;
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}

},{"./Agent":1,"./Common/Vec2":5,"./Engine":6,"./Entities/Context":7,"./Entities/Entity":8,"./Entities/Group":9,"./Entities/Helpers/Joint":10,"./Entities/Path":13,"./Entities/Wall":14,"./World":15}]},{},["CrowdSim"])


//# sourceMappingURL=CrowdSim.js.map