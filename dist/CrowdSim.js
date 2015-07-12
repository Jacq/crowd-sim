(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
'use strict';

var Agent = require('../Entities/Agent');
var Context = require('../Entities/Context');
var Vec2 = require('../Common/Vec2');
var Panic = require('./Panic');

var Group = function(world, options) {
  this.world = world;
  var startContext = null;
  if (options && options.startContext) {
    startContext = options.startContext.getRandomPoint.bind(options.startContext);
  }

  this.options = Lazy(options).defaults({
    pos: startContext,
    size: 0.5,
    path: null,
    agentsNumber: 10,
    startContext: null,
    endContext: null,
    behavior: new Panic(this.world),
    debug: false,
    start: {prob: 0, // Adds agents per step in startContext
            rate: 0, // Adds agents probability per step in startContext
            max: 100},
    end: {prob: 0, // Removes agents per step in endContext
          rate: 0} // Removes agents probability per step in endContext
  }).toObject();

  this.id = 'G' + Group.id++;

  this.behavior = this.options.behavior;
  this.agents = [];
  this.agentsNumber = this.options.agentsNumber;

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

Group.prototype.generateAgents = function(agentsNumber, startContext) {
  if (!startContext) {
    startContext = this.options.startContext;
  }
  var newAgents = [];
  for (var i = 0; i < agentsNumber; i++) {
    var pos = isNaN(this.options.pos) ? this.options.pos() : this.options.pos;
    var size = isNaN(this.options.size) ? this.options.size() : this.options.size;
    var agent = new Agent(pos[0], pos[1], this,{size: size, debug: this.options.debug});
    agent.followPath();
    newAgents.push(agent);
  }
  return newAgents;
};

Group.prototype.addAgents = function(agentsNumber) {
  var newAgents = this.generateAgents(agentsNumber);
  this.agents = this.agents.concat(newAgents);
  this.world.addAgents(newAgents);
};

Group.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.agents.indexOf(agents[i]);
    this.agents.splice(j, 1);
  }
  this.world.removeAgents(agents);
};

Group.prototype.addAgent = function(x, y) {
  var size = isNaN(this.options.size) ? this.options.size() : this.options.size;
  var agent = new Agent(x, y, this, {size: size});
  this.agents.push(agent);
};

Group.prototype.getstartContext = function() {
  return this.options.startContext;
};

Group.prototype.getContext = function() {
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
  if (this.agents.length === 0) {
    this.addAgents(this.agentsNumber);
  }

  var start = this.options.start;
  if (start && start.rate > 0 && start.prob > 0 && this.agents.length < start.max) {
    var probBirth = Math.random();
    if (probBirth < start.prob) {
      var rate = start.rate ;
      if (start.rate + this.agents.length > start.max) {
        rate = start.max;
      }
      this.addAgents(rate);
    }
  }
  if (this.options.endContext) {
    var end = this.options.end;
    var agentsIn = this.world.agentsInContext(this.options.endContext, this.agents);
    if (agentsIn.length > 0 && end && end.rate > 0 && end.prob > 0) {
      var probDie = Math.random();
      if (probDie < end.prob) {
        this.removeAgents(agentsIn);
      }
    }
  }
};

Group.id = 0;

module.exports = Group;

},{"../Common/Vec2":4,"../Entities/Agent":7,"../Entities/Context":8,"./Panic":3}],3:[function(require,module,exports){
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

// path point, point, other agent {point , radius}
Panic.prototype.getAccel = function(agent, target) {
  Behavior.prototype.getAccel.call(this, agent, target);
  var desiredForce = Vec2.create();
  var agentsForce = Vec2.create();
  var wallsForce = Vec2.create();
  var accel = Vec2.create();
  var distanceToTarget;

  // check agent desired force
  Vec2.add(accel, agentsForce, wallsForce);
  if (target) { // agent is going somewhere?
    distanceToTarget = Vec2.distance(agent.pos, target.pos);
    if (distanceToTarget > target.getRadius()) {
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
        var wallsToAgentForce = this.calculateWallForce(agent, projection, wall.getWidth());
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

},{"../Common/Vec2":4,"./Behavior":1}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
/* global window,module, exports : true, define */

var CrowdSim = {
  Entity: require('./Entities/Entity'),
  Agent: require('./Entities/Agent'),
  Context: require('./Entities/Context'),
  Wall: require('./Entities/Wall'),
  Path: require('./Entities/Path'),
  Group: require('./Behavior/Group'),
  World: require('./World'),
  Engine: require('./Engine'),
  Render: require('./Render/Render')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}

},{"./Behavior/Group":2,"./Engine":6,"./Entities/Agent":7,"./Entities/Context":8,"./Entities/Entity":9,"./Entities/Path":11,"./Entities/Wall":12,"./Render/Render":20,"./World":22}],6:[function(require,module,exports){
'use strict';

//var $ = jQuery =

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
  this._step();
  return this.running;
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
  var timeStepSize = options.timeStepSize;
  var entities = this.world.entities;
  Lazy(entities.agents).each(function(agent) {
    agent.step(timeStepSize);
    if (agent.selected) {
      world.agentSelected = agent;
      return;
    }
  });
  Lazy(this.world.getGroups()).each(function(group) {
    group.step(timeStepSize);
  });

  this.iterations++;
  if (options.onStep) {
    options.onStep(world);
  }

  if (this.running) {
    var that = this;
    setTimeout(function() {
      that._step();
    }, options.timeStepRun * 1000);
  }
};

Engine.prototype.stop = function() {
  if (!this.running) {
    return;
  }
  this.running = false;
  return this.running;
};
Engine.prototype.reset = function() {
  this.iterations = 0;
  this.running = false;
  this.world.restore();
};

module.exports = Engine;

},{}],7:[function(require,module,exports){
'use strict';

var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');

var Agent = function(x, y, group, options) {
  var that = this;
  Entity.call(this, x, y);
  this.id = Agent.id++;

  Lazy(options).defaults(Agent.defaults).each(function(v, k) {
    that[k] = v;
  });
  this.group = group;
  this.vel = Vec2.create();
  this.behavior = null; // function set by group
  if (this.debug) {
    this.debug = {};
  }
};

Agent.prototype.getRadius = function() {
  return this.radius;
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

  if (this.debug) {
    if (accel && (isNaN(accel[0]) || isNaN(accel[1]))) {
      throw 'Agent pos invalid';
    }
  }

  this.move(accel, stepSize);
  // update target to next if arrive at current
  if (this.target) {
    var distToTarget = Vec2.distance(this.pos, this.target.pos);
    if (distToTarget < this.target.getRadius()) {
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
};

Agent.defaults = {
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

},{"../Common/Vec2":4,"./Entity":9}],8:[function(require,module,exports){

var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');

var Context = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = 'C' + Context.id++;
  this.options = Lazy(options).defaults(Context.defaults).toObject();
};

Context.prototype.setArea = function(x, y) {
  this.options.width = Math.abs(this.pos[0] - x);
  this.options.height = Math.abs(this.pos[1] - y);
};

Context.prototype.getWidth = function() {
  return this.options.width;
};

Context.prototype.getHeight = function() {
  return this.options.height;
};

Context.prototype.getRandomPoint = function() {
  var x = this.pos[0] + Math.random() * this.options.width;
  var y = this.pos[1] + Math.random() * this.options.height;
  return Vec2.fromValues(x, y);
};

Context.prototype.in = function(pos) {
  var isIn = (this.pos[0] < pos[0] && pos[0] < (this.pos[0] + this.options.width)) && (this.pos[1] < pos[1] && pos[1] < (this.pos[1] + this.options.height));
  return isIn;
};

Context.defaults = {
  mobility: 1,
  hazardLevel: 0,
  width: 10,
  height: 10
};
Context.id = 0;
Context.type = 'context';

module.exports = Context;

},{"../Common/Vec2":4,"./Entity":9}],9:[function(require,module,exports){
var Vec2 = require('../Common/Vec2');

var Entity = function(x, y, world) {
  this.extra = {};
  this.pos = Vec2.fromValues(x, y);
  this.world = world;
};

Entity.prototype.updatePos = function(x, y) {
  this.pos[0] = x;
  this.pos[1] = y;
};

module.exports = Entity;

},{"../Common/Vec2":4}],10:[function(require,module,exports){
var Entity = require('./Entity');

var Joint = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = Joint.id++;
  this.options = Lazy(options).defaults(Joint.defaults).toObject();
};

Joint.prototype.getRadius = function() {
  return this.options.radius;
};

Joint.defaults = {
  radius: 4
};
Joint.id = 0;
Joint.type = 'joint';

module.exports = Joint;

},{"./Entity":9}],11:[function(require,module,exports){
'use strict';

var Entity = require('./Entity');
var Joint = require('./Joint');

var Path = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = 'P' + Path.id++;
  this.options = Lazy(options).defaults(Path.defaults).toObject();
  if (options && options.waypoints) {
    this.wps = [];
    for (var i in options.waypoints) {
      var wp = options.waypoints[i];
      var radius = wp.length === 3 ? wp[2] : this.options.radius; // global radius or given one for joint
      this.wps.push(new Joint(wp[0], wp[1], world, {radius: radius}));
    }
  }else {
    this.wps = [new Joint(x, y, world, {radius: this.options.radius})];
  }
};

Path.prototype.getWidth = function() {
  return this.options.width;
};

Path.prototype.reverse = function() {
  this.wps = Lazy(this.wps).reverse().toArray();
};

Path.prototype.addWaypoint = function(x, y, radius) {
  Entity.prototype.updatePos.call(this,x,y);
  if (!radius) {
    radius = this.wps[this.wps.length - 1].radius;
  }
  var wp = new Joint(x, y, this.world, {radius: radius});
  this.wps.push(wp);
  return wp;
};

Path.defaults = {
  width: 0.2,
  radius: 4
};
Path.id = 0;
Path.type = 'path';

module.exports = Path;

},{"./Entity":9,"./Joint":10}],12:[function(require,module,exports){

var Vec2 = require('../Common/Vec2');
var Entity = require('./Entity');
var Joint = require('./Joint');

var Wall = function(x, y, world, options) {
  Entity.call(this, x, y, world);
  this.id = Wall.id++;
  this.options = Lazy(options).defaults(Wall.defaults).toObject();
  // n joints, n-1 sections
  if (options && options.path) {
    this.path = [];
    for (var i in options.path) {
      var p = options.path[i];
      this.path.push(new Joint(p[0], p[1], world, {radius: this.getCornerWidth()}));
    }
  } else {
    this.path = [new Joint(x, y, world, {radius: this.getCornerWidth()})];
  }
};

Wall.prototype.getCornerWidth = function() {
  return this.options.width * 2;
};

Wall.prototype.getWidth = function() {
  return this.options.width;
};

Wall.prototype.getProjection = function(point, segment) {
  if (segment < 0 || segment >= this.path.length - 1) {
    throw 'Segment out of bounds';
  }
  var projection = Vec2.create();
  return Vec2.projectionToSegment(projection, point, this.path[segment].pos, this.path[segment + 1].pos);
};

Wall.prototype.addPath = function(x, y) {
  Entity.prototype.updatePos.call(this,x,y);
  var joint = new Joint(x, y, this.world, {radius: this.getCornerWidth()});
  this.path.push(joint);
  return joint;
};

Wall.defaults = {
  width: 0.2
};
Wall.id = 0;
Wall.type = 'wall';

module.exports = Wall;

},{"../Common/Vec2":4,"./Entity":9,"./Joint":10}],13:[function(require,module,exports){
'use strict';

var Vec2 = require('../Common/Vec2');
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Agent = function(agent) {
  if (!agent) {
    throw 'Agent object must be defined';
  }
  //var display = new PIXI.Sprite(options.texture);

  Entity.call(this, agent);
  this.sprite = new PIXI.Sprite(Agent.texture);
  Entity.prototype.createGraphics.call(this,Agent.container, this.sprite);
  this.sprite.visible = Agent.detail.level > 0;
  this.sprite.anchor.set(0.5);
  //this.display.alpha = 0.5;
  var size = agent.size;
  this.sprite.height = size;
  this.sprite.width = size;
  this.sprite.position.x = agent.pos[0];
  this.sprite.position.y = agent.pos[1];
};

Agent.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Agent.container, this.sprite);
  Entity.prototype.destroyGraphics.call(this,Agent.container, this.graphics);
};

Agent.prototype.render = function() {
  if (!Agent.detail.level) {
    this.sprite.visible = false;
    this.sprite.alpha = 0;
    if (this.graphics) {
      this.graphics.clear();
    }
    return;
  } else {
    this.sprite.alpha = 1;
    this.sprite.visible = true;
  }
  Entity.prototype.render.call(this);

  var e = this.entityModel;
  this.sprite.position.set(e.pos[0], e.pos[1]);
  this.sprite.rotation = Math.atan2(e.vel[1], e.vel[0]) - Math.PI / 2;

  if (Agent.detail.level > 1) {
    if (!this.graphics) {
      this.graphics = Entity.prototype.createGraphics.call(this,Agent.debugContainer);
      this.circle = new PIXI.Circle(e.pos[0],e.pos[1], e.size / 2);
      //this.graphics.addChild(this.circle);
    }
    this.graphics.clear();
  }

  if (Agent.detail.level > 1) {
    if (this.circle) {
      this.circle.x = e.pos[0];
      this.circle.y = e.pos[1];
      this.graphics.lineStyle(0.1, Colors.Agent);
      this.graphics.drawShape(this.circle);
    }
  }
  if (Agent.detail.level > 2) {
    this.graphics.moveTo(e.pos[0], e.pos[1]);
    this.graphics.lineTo(e.pos[0] + e.vel[0], e.pos[1] + e.vel[1]);
  }
  if (e.debug) {
    if (Agent.detail.level > 3 && e.debug.forces) {
      var force = Vec2.create();
      for (var f in e.debug.forces) {
        this.graphics.lineStyle(0.1, Colors.Forces[f]);
        this.graphics.moveTo(e.pos[0], e.pos[1]);
        Vec2.normalize(force, e.debug.forces[f]);
        this.graphics.lineTo(e.pos[0] + force[0], e.pos[1] + force[1]);
      }
    }
    if (isNaN(e.pos[0]) || isNaN(e.pos[1])) {
      throw 'Agent position undefined';
    }
  }
};

Agent.texture = null; // agents texture
Agent.debugContainer = null; // special container use to render all agents, e.g particleContainer
Agent.detail = new Detail(4);

module.exports = Agent;

},{"../Common/Vec2":4,"./Base":14,"./Detail":16,"./Entity":17}],14:[function(require,module,exports){
'use strict';

var Colors = {
  Hover: 0x646729,
  Context: 0xe1eca0,
  Agent: 0xFF0000,
  Wall: 0x00FF00,
  Joint: 0xFFFFFF,
  Path: 0xe00777,
  Waypoint: 0x7a7a7a,
  Forces: {desired: 0xfffff,
          agents: 0xFF0000,
          walls: 0xc49220
          }
};

var Fonts = {
  default: {font: '2px Mono monospace', fill: 0xFFFFFF,
  align: 'center'},
  resolution: 12
};

module.exports.Colors = Colors;
module.exports.Fonts = Fonts;

},{}],15:[function(require,module,exports){
'use strict';

var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Context = function(context) {
  if (!context) {
    throw 'Context object must be defined';
  }
  Entity.call(this, context);
};

Context.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Context.container, this.graphics);
};

Context.prototype.createGraphics = function(context) {
  this.graphics = Entity.prototype.createGraphics.call(this,Context.container);
  this.rect = new PIXI.Rectangle(0, 0, 0, 0);
  this.label = new PIXI.Text(context.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  this.rect.entityModel = context;
  this.graphics.entity = this;
};

Context.prototype.getAnchor = function(init) {
  var context = this.entityModel;
  return {x: context.x, y: context.y};
};

Context.prototype.mousedown = function(init) {

};

Context.prototype.dragTo = function(pos, anchor) {
  var context = this.entityModel;
  context.pos[0] = pos.x - context.getWidth() / 2;
  context.pos[1] = pos.y - context.getHeight() / 2;
};

Context.prototype.mouseup = function(init) {

};

Context.prototype.render = function(options) {
  if (!Context.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var context = this.entityModel;
  // init render
  if (!this.graphics && Context.detail.level) {
    this.createGraphics(context);
  } else {
    this.graphics.clear();
  }

  if (Context.detail.level > 0) {
    var w = context.getWidth();
    var h = context.getHeight();
    this.rect.x = context.pos[0];
    this.rect.y = context.pos[1];
    this.rect.width = w;
    this.rect.height = h;
    this.label.x = context.pos[0] + w / 2 - this.label.width / 2;
    this.label.y = context.pos[1] + h / 2 - this.label.height / 2;
    this.graphics.beginFill(this.graphics.hover ? Colors.Hover : Colors.Context, this.graphics.hover ? 0.9 : 0.3);
    this.graphics.drawShape(this.rect);
    this.graphics.endFill();
  }
};

Context.prototype.setArea = function(x, y) {
  this.entityModel.setArea(x, y);
};

Context.detail = new Detail(2);

module.exports = Context;

},{"./Base":14,"./Detail":16,"./Entity":17}],16:[function(require,module,exports){
'use strict';

var Detail = function(maxDetail, detail) {
  this.maxDetail = maxDetail;
  this.level = detail || 1;
};

Detail.prototype.cycleDetail = function(detail) {
  if (detail) {
    this.level = detail;
  } else {
    this.level ++;
    if (this.level > this.maxDetail) {
      this.level = 0;
    }
  }
};

module.exports = Detail;

},{}],17:[function(require,module,exports){
'use strict';

var Base = require('./Base');

/*
* Base render prototype
*/
var Entity = function(entity) {
  if (!entity) {
    throw 'Entity undefined';
  }
  this.entityModel = entity;
  this.entityModel.extra.view = this;
  this.selected = false;
};
Entity.prototype.createGraphics = function(container, graphics) {
  if (!graphics) {
    graphics = new PIXI.Graphics();
  }
  Entity.setInteractive(graphics);
  graphics._entityView = this;
  // add it the container so we see it on our screens.
  container.addChild(graphics);
  return graphics;
};

Entity.prototype.destroyGraphics = function(container, graphics) {
  if (graphics) {
    graphics.destroy();
    container.removeChild(graphics);
  }
};

Entity.setInteractive = function(displayObject) {
  displayObject.interactive = true;
  displayObject.buttonMode = true;
  displayObject.mouseover = Entity.mouseover;
  displayObject.mouseout = Entity.mouseout;
  displayObject.mousedown = Entity.mousedown;
  displayObject.mouseup = Entity.mouseup;
  displayObject.mousemove = Entity.mousemove;
};

Entity.prototype.render = function(graphics) {
  //this.display.clear();
};

Entity.prototype.destroy = function(container, graphics) {
  this.destroyGraphics(container, graphics);
};

Entity.mousedown = null;
Entity.mousemove = null;
Entity.mouseup = null;
Entity.mouseover = null;
Entity.mouseout = null;

module.exports = Entity;

},{"./Base":14}],18:[function(require,module,exports){
'use strict';

var Vec2 = require('../Common/Vec2');
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Joint = function(joint, texture, scalable) {
  if (!joint) {
    throw 'Joint object must be defined';
  }
  Entity.call(this, joint);
  this.texture = texture;
  this.scalable = scalable;
};

Joint.prototype.destroy = function(graphics) {
  graphics.addChild(this.sprite);
};

Joint.prototype.createGraphics = function(graphics) {
  this.sprite = new PIXI.Sprite(this.texture);
  Entity.setInteractive(this.sprite);
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.sprite.entity = this;
  this.sprite.alpha = 0.5;
  graphics.addChild(this.sprite);
  this.render();
};

Joint.prototype.render = function() {
  this.sprite.x = this.entityModel.pos[0];
  this.sprite.y = this.entityModel.pos[1];
  this.sprite.width = 2 * this.entityModel.getRadius();
  this.sprite.height = 2 * this.entityModel.getRadius();
};

Joint.prototype.getAnchor = function(init) {
  return {x: this.entityModel.pos[0], y: this.entityModel.pos[1]};
};

Joint.prototype.dragTo = function(pos, anchor) {
  var anchorV2 = Vec2.fromValues(anchor.x,anchor.y);
  var radius = Vec2.length(anchorV2);
  var posV2 = Vec2.fromValues(pos.x,pos.y);
  Vec2.subtract(posV2,posV2,this.entityModel.pos);
  var newRadius = Vec2.length(posV2);
  // calculate new size or position if dragging border or body
  if (this.scalable && newRadius >  this.entityModel.getRadius() * 0.80) {
    this.entityModel.radius  = newRadius;
    this.sprite.width = 2 * newRadius;
    this.sprite.height = 2 * newRadius;
  } else {
    this.entityModel.pos[0] = pos.x;
    this.entityModel.pos[1] = pos.y;
    this.sprite.x = pos.x;
    this.sprite.y = pos.y;
  }
};

module.exports = Joint;

},{"../Common/Vec2":4,"./Base":14,"./Detail":16,"./Entity":17}],19:[function(require,module,exports){
'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

var Path = function(path) {
  if (!path) {
    throw 'Path object must be defined';
  }
  Entity.call(this, path);
};

Path.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Path.container, this.graphics);
  this.destroyGraphics(Path.container);
};

Path.prototype.createGraphics = function(path) {
  this.graphics = Entity.prototype.createGraphics.call(this,Path.container);
  this.label = new PIXI.Text(path.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  var wps = path.wps;
  this.label.x = wps[0].pos[0] - this.label.width / 2;
  this.label.y = wps[0].pos[1] - this.label.height / 2;
  if (wps && wps.length > 0) {
    this.joints = [];
    for (var i in wps) {
      var wp = wps[i];
      var joint = new Joint(wp, Path.texture);
      joint.createGraphics(this.graphics);
      this.joints.push(joint);
    }
  }
};

Path.prototype.render = function(options) {
  if (!Path.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var path = this.entityModel;
  // init render
  if (!this.graphics && Path.detail.level > 0) {
    this.createGraphics(path);
  } else {
    this.graphics.clear();
  }

  if (this.joints && this.joints.length > 0) {
    var points  = [];
    if (Path.detail.level > 0) {
      this.graphics.lineStyle(path.getWidth(), Colors.Path, 0.6);
      //this.graphics.moveTo(this.joints[0].pos[0], this.joints[0].pos[1]);
      for (var i = 0; i < this.joints.length; i++) {
        //this.graphics.lineTo(this.joints[lj].pos[0], this.joints[lj].pos[1]);
        var joint = this.joints[i].entityModel;
        points.push(joint.pos[0],joint.pos[1]);
        this.joints[i].render();
        //this.graphics.drawCircle(joint.pos[0],joint.pos[1],joint.radius);
      }
      this.graphics.drawPolygon(points);
      this.label.x = this.joints[0].entityModel.pos[0] - this.label.width / 2;
      this.label.y = this.joints[0].entityModel.pos[1] - this.label.height / 2;
    }
    //this.display.beginFill(Colors.Joint);
    if (Path.detail.level > 1) {
      /*for (var j in this.joints) {
        this.graphics.drawShape(this.joints[j]);
      }*/
    }
    //this.display.endFill();

  }
};

Path.prototype.addWaypoint = function(x, y) {
  var path = this.entityModel;
  var wp = path.addWaypoint(x, y);
  var joint = new Joint(wp, Path.texture);
  joint.createGraphics(this.graphics);
  this.joints.push(joint);
  return joint;
};

Path.texture = null; // paths joint texture
Path.detail = new Detail(2);

module.exports = Path;

},{"./Base":14,"./Detail":16,"./Entity":17,"./Joint":18}],20:[function(require,module,exports){
'use strict';

var Render = {
  Entity: require('./Entity'),
  Agent: require('./Agent'),
  Context: require('./Context'),
  Path: require('./Path'),
  Wall: require('./Wall')
};

module.exports = Render;

},{"./Agent":13,"./Context":15,"./Entity":17,"./Path":19,"./Wall":21}],21:[function(require,module,exports){
'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;
var Fonts = Base.Fonts;

var Wall = function(wall) {
  if (!wall) {
    throw 'Wall object must be defined';
  }
  Entity.call(this, wall, Wall.container);
};

Wall.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Wall.container, this.graphics);
  this.destroyGraphics(Wall.container);
};

Wall.prototype.createGraphics = function(wall) {
  this.graphics = Entity.prototype.createGraphics.call(this,Wall.container);
  this.joints = [];
  for (var j in wall.path) {
    var c = wall.path[j];
    var joint = new Joint(c, Wall.texture);
    joint.createGraphics(this.graphics);
    this.joints.push(joint);
  }
};

Wall.prototype.render = function(options) {
  if (!Wall.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var wall = this.entityModel;
  var path = wall.path;

  // init render
  if (!this.graphics && Wall.detail.level > 0) {
    this.createGraphics(wall);
  } else {
    this.graphics.clear();
    // color on hover
  }

  if (Wall.detail.level > 0) {
    //this.display.beginFill(Colors.Wall, 0.1);
    this.graphics.lineStyle(wall.getWidth(), this.graphics.hover ? Colors.Hover : Colors.Wall);
    //this.graphics.moveTo(path[0][0], path[0][1]);
    var points = [];
    for (var i = 0; i < path.length ; i++) {
      //this.graphics.lineTo(path[i][0], path[i][1]);
      points.push(path[i].pos[0],path[i].pos[1]);
      this.joints[i].render();
    }
    this.graphics.drawPolygon(points);
    //this.display.endFill();
  }
  if (Wall.detail.level > 1) {
    /*this.graphics.beginFill(this.graphics.hover ? Colors.Hover : Colors.Joint);
    for (var j in this.joints) {
      if (this.joints[j].hover) {

      }
      this.graphics.drawShape(this.joints[j].circle);
    }
    this.graphics.endFill();*/
  }
};

Wall.prototype.addPath = function(x, y) {
  var wall = this.entityModel;
  var j = wall.addPath(x, y);
  var joint = new Joint(j , Wall.texture);
  joint.createGraphics(this.graphics);
  this.joints.push(joint);
};

Wall.texture = null; // wall joints texture
Wall.detail = new Detail(2);

module.exports = Wall;

},{"./Base":14,"./Detail":16,"./Entity":17,"./Joint":18}],22:[function(require,module,exports){
'use strict';
/* global CrowdSim */

var World = function(x, y, width, height) {
  var that = this;
  this.groups = [];
  this.entities = {
    agents: [],
    contexts: [],
    paths: [],
    walls: [],
  };
  this.wrap = true;
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.onCreateAgents = null;
  this.onDestroyAgents = null;
  this.onCreateEntity = null;
  this.onDestroyEntity = null;
};

World.prototype.getDefaultGroup = function() {
  return this.groups[0];
};

World.prototype.getGroups = function() {
  return this.groups;
};

World.prototype.addAgents = function(agents) {
  this.entities.agents = this.entities.agents.concat(agents);
  if (this.onCreateAgents) {
    this.onCreateAgents(agents);
  }
};

World.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.entities.agents.indexOf(agents[i]);
    this.entities.agents.splice(j,1);
  }
  if (this.onDestroyAgents) {
    this.onDestroyAgents(agents);
  }
};

World.prototype._onCreate = function(entity) {
  if (this.onCreateEntity) {
    this.onCreateEntity(entity);
  }
};

World.prototype._onDestroy = function(entity) {
  if (this.onDestroyEntity) {
    this.onDestroyEntity(entity);
  }
};

World.prototype.addContext = function(context) {
  this.entities.contexts = this.entities.contexts.concat(context);
  this._onCreate(context);
};

World.prototype.addGroup = function(group) {
  this.groups = this.groups.concat(group);
  this._onCreate(group);
};

World.prototype.addPath = function(path) {
  this.entities.paths = this.entities.paths.concat(path);
  this._onCreate(path);
};

World.prototype.addWall = function(wall) {
  this.entities.walls = this.entities.walls.concat(wall);
  this._onCreate(wall);
};

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.entities.agents = JSON.parse(this.agentsSave);
};

// TODO add spatial structure to optimize this function
World.prototype.getNeighbours = function(agent) {
  return this.entities.agents;
};

// TODO add spatial structure to optimize this function
World.prototype.getNearWalls = function(agent) {
  return this.entities.walls;
};

// TODO add spatial structure to optimize this function
World.prototype.agentsInContext = function(context, agents) {
  if (!agents) {
    agents = this.entities.agents;
  }
  var agentsIn = [];
  for (var i in agents) {
    var agent = agents[i];
    if (context.in(agent.pos)) {
      agentsIn.push(agent);
    }
  }
  return agentsIn;
};

module.exports = World;

},{}]},{},[5])


//# sourceMappingURL=CrowdSim.js.map