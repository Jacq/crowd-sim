(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var Vec2 = require('./Common/Vec2');

var Agent = function(x, y, group, options) {
  var that = this;
  this.id = Agent.id++;
  // merge options with agent
  Lazy(options).defaults(Agent.defaults).each(function(v, k) {
    that[k] = v;
  });
  this.group = group;
  this.pos = Vec2.fromValues(x, y);
  this.vel = Vec2.create();
  this.behavior = null; // function set by group
  if (this.debug) {
    this.debug = {};
  }
};

Agent.prototype.getRadius = function() {
  return this.radius;
};

Agent.prototype.followGroupPath = function(index) {
  var path = this.group.getPath();
  if (path) {
    var wps = path.getWaypoints();
    this.target = wps[index || 0];
    this.pathNextIdx = 1;
  } else {
    this.target = null;
    this.pathNextIdx = 0;
  }
};

Agent.prototype.step = function(stepSize) {
  var path = this.group.getPath();
  var wps = path ? path.getWaypoints() : null;

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
      if (this.pathNextIdx < wps.length) {
        // follow to next waypoint
        this.target = wps[this.pathNextIdx++];
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

},{"./Common/Vec2":4}],2:[function(require,module,exports){
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
      for (var s = 0; s < wall.getCorners().length - 1; s++) { // check each segment of wall
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

},{"../Common/Vec2":4,"./Behavior":2}],4:[function(require,module,exports){
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
  Agent: require('./Agent'),
  Entity: require('./Entities/Entity'),
  Context: require('./Entities/Context'),
  Wall: require('./Entities/Wall'),
  Path: require('./Entities/Path'),
  Group: require('./Entities/Group'),
  World: require('./World'),
  Engine: require('./Engine'),
  Render: require('./Render/Render')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}

},{"./Agent":1,"./Engine":6,"./Entities/Context":7,"./Entities/Entity":8,"./Entities/Group":9,"./Entities/Path":11,"./Entities/Wall":12,"./Render/Render":21,"./World":23}],6:[function(require,module,exports){
'use strict';

//var $ = jQuery =

var Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.world.save();

  this.settings = Lazy(options).defaults(Engine.defaults).toObject();
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
  var opts = this.settings;
  var timeStepSize = opts.timeStepSize;
  var agents = this.world.getAgents();
  Lazy(agents).each(function(agent) {
    agent.step(timeStepSize);
    if (agent.selected) {
      world.agentSelected = agent;
      return;
    }
  });
  Lazy(this.world.getGroups()).each(function(group) {
    group.step(timeStepSize);
  });

  if (this.running) {
    var that = this;
    setTimeout(function() {
      that._step();
    }, opts.timeStepRun * 1000);
  }

  this.iterations++;
  if (this.onStep) {
    this.onStep(world);
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

  var groups = this.world.getGroups();
  Lazy(groups).each(function(g) {
    g.emptyAgents();
  });
  //this.world.restore();
};

Engine.defaults = {
  timeStepSize: 0.1,
  timeStepRun: 0.001
};

module.exports = Engine;

},{}],7:[function(require,module,exports){

var Entity = require('./Entity');
var Vec2 = require('../Common/Vec2');

var Context = function(x, y, parent, options) {
  Entity.call(this, x, y, parent);
  this.id = 'C' + Context.id++;
  this.options = Lazy(options).defaults(Context.defaults).toObject();
  this.entities.groups = [];
};

Context.prototype.destroy = function() {
  Lazy(this.entities.groups).each(function(g) {
    g.unAssignContext(context);
  });
  Entity.prototype.destroy.call(this);
};

Context.prototype.assignToGroup = function(entity) {
  var idx = this.entities.groups.indexOf(entity);
  if (idx > -1) {
    throw 'Entity already associated';
  } else {
    this.entities.groups.push(entity);
  }
};

Context.prototype.unassignFromGroup = function(group) {
  var idx = this.entities.groups.indexOf(group);
  if (idx > -1) {
    this.entities.groups.splice(idx, 1);
  } else {
    throw 'Entity not associated';
  }
};

Context.prototype.getAssignedGroups = function() {
  return this.entities.groups;
};

Context.prototype.unassignAll = function(entity) {
  this.entities.length = 0;
};

Context.prototype.setArea = function(x, y) {
  this.options.width = Math.abs(this.pos[0] - x) * 2;
  this.options.height = Math.abs(this.pos[1] - y) * 2;
};

Context.prototype.getWidth = function() {
  return this.options.width;
};

Context.prototype.getHeight = function() {
  return this.options.height;
};

Context.prototype.getRandomPoint = function() {
  var x = this.pos[0] + (Math.random() - 0.5) * this.options.width;
  var y = this.pos[1] + (Math.random() - 0.5) * this.options.height;
  return Vec2.fromValues(x, y);
};

Context.prototype.in = function(pos) {
  var w2 = this.options.width / 2;
  var h2 = this.options.height / 2;
  var isIn = (this.pos[0] - w2 < pos[0] && pos[0] < this.pos[0] + w2) &&
             (this.pos[1] - h2 < pos[1] && pos[1] < this.pos[1] + h2);
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

},{"../Common/Vec2":4,"./Entity":8}],8:[function(require,module,exports){
var Vec2 = require('../Common/Vec2');

var Entity = function(x, y, parent) {
  this.extra = {}; // for extra information, e.g. render object
  this.pos = Vec2.fromValues(x, y);
  this.entities = {}; // stores diferent structures with children entities
  this.view = null; // to store references to render objects
  if (parent) {
    this.parent = parent;
    // request add to parent the entity
    this.parent.addEntity(this);
  }
};

Entity.prototype.destroy = function() {
  if (parent) {
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

},{"../Common/Vec2":4}],9:[function(require,module,exports){
'use strict';

var Entity = require('./Entity');
var Context = require('./Context');
var Agent = require('../Agent');
var Vec2 = require('../Common/Vec2');
var Panic = require('../Behavior/Panic');

var Group = function(x, y, parent, options) {
  Entity.call(this, x, y, parent);
  this.id = 'G' + Group.id++;
  this.options = Lazy(options).defaults(Group.defaults).toObject();
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

Group.prototype.getStartContext = function() {
  return this.entities.startContext;
};

Group.prototype.assignStartContext = function(context) {
  context.assignToGroup(this);
  this.entities.startContext = context;
};

Group.prototype.getEndContext = function() {
  return this.entities.endContext;
};

Group.prototype.assignEndContext = function(context) {
  context.assignToGroup(this);
  this.entities.endContext = context;
};

Group.prototype.unAssignContext = function(context) {
  if (this.entities.startContext === context) {
    this.entities.startContext = null;
    context.unassign(this);
  }
  if (this.entities.endContext === context) {
    this.entities.endContext = context;
    context.unassign(this);
  }
};

Group.prototype.assignBehavior = function(behavior) {
  this.behavior = behavior;
};

Group.prototype.assignPath = function(path) {
  this.entities.path = path;
  for (var i  in this.agents) {
    this.agents[i].followGroupPath();
  }
};

Group.prototype.generateAgents = function(agentsCount, startContext) {
  if (!startContext) {
    startContext = this.entities.startContext;
  }
  var newAgents = [];
  var opts = this.options;
  for (var i = 0; i < agentsCount; i++) {
    var pos = this.entities.startContext ? this.entities.startContext.getRandomPoint() : this.pos;
    var size = opts.agentsSizeMin;
    if (opts.agentsSizeMin !== opts.agentsSizeMax) {
      // random uniform distribution
      size = opts.agentsSizeMin + Math.random() * (opts.agentsSizeMax - opts.agentsSizeMin);
    }
    var agent = new Agent(pos[0], pos[1], this, {size: size, debug: opts.debug});
    agent.followGroupPath();
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

Group.prototype.addAgent = function(agent) {
  this.agents.push(agent);
};

Group.prototype.step = function() {
  if (this.agents.length === 0) {
    this.addAgents(this.options.agentsCount);
  }

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
  if (this.entities.endContext) {
    var agentsIn = this.parent.agentsInContext(this.entities.endContext, this.agents);
    if (agentsIn.length > 0 && this.options.endRate > 0 && this.options.endProb > 0) {
      var probDie = Math.random();
      if (probDie < this.options.endProb) {
        this.removeAgents(agentsIn);
      }
    }
  }
};

Group.defaults = {
  agentsSizeMin: 0.5,
  agentsSizeMax: 0.5,
  agentsCount: 10,
  agentsMax: 100,
  debug: false,
  startProb: 0, // Adds agents per step in startContext
  startRate: 0, // Adds agents probability per step in startContext
  endProb: 0, // Removes agents per step in endContext
  endRate: 0 // Removes agents probability per step in endContext
};
Group.id = 0;
Group.type = 'group';

module.exports = Group;

},{"../Agent":1,"../Behavior/Panic":3,"../Common/Vec2":4,"./Context":7,"./Entity":8}],10:[function(require,module,exports){
var Entity = require('./Entity');

var Joint = function(x, y, parent, options) {
  Entity.call(this, x, y, parent);
  this.id = 'J' + Joint.id++;
  this.options = Lazy(options).defaults(Joint.defaults).toObject();
};

Joint.prototype.destroy = function() {
  this.parent.removeEntity(this);
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

},{"./Entity":8}],11:[function(require,module,exports){
'use strict';

var Entity = require('./Entity');
var Joint = require('./Joint');

var Path = function(x, y, parent, options) {
  Entity.call(this, x, y, parent);
  this.id = 'P' + Path.id++;
  this.options = Lazy(options).defaults(Path.defaults).toObject();
  this.entities.wps = [];
  if (x && y) {
    this.addWaypoint(x,y,this.options.radius);
  }
};

Path.prototype.addEntity = function(joint) {
  this.entities.wps.push(joint);
};

Path.prototype.removeEntity = function(joint) {
  var idx = this.entities.wps.indexOf(joint);
  if (idx !== -1) {
    this.entities.wps.splice(idx, 1);
    if (this.entities.wps.length === 0) {
      this.destroy();
    }
  } else {
    throw 'Corner not found in wall';
  }
};

Path.prototype.destroy = function() {
  Lazy(this.entities.wps).each(function(j) {
    j.destroy();
  });
  this.entities.wps.length = 0;
  Entity.prototype.destroy.call(this);
};

Path.prototype.addWaypoints = function(wps) {
  for (var i in wps) {
    var wp = wps[i];
    var radius = null;
    if (wp.length === 2) {
      radius = wp[3];
    }
    this.addWaypoint(wp[0],wp[1],radius);
  }
};

Path.prototype.addWaypoint = function(x, y, radius) {
  Entity.prototype.updatePos.call(this,x,y);
  if (!radius) {
    radius = this.entities.wps.length === 0 ? this.options.radius : this.entities.wps[this.entities.wps.length - 1].radius;
  }
  var wp = new Joint(x, y, this, {radius: radius});
  return wp;
};

Path.prototype.destroyWaypoint = function(wp) {
  var idx = this.entities.wps.indexOf(wp);
  if (idx > -1) {
    wp.destroy();
    this.entities.wps.splice(idx,1);
  } else {
    throw 'Joint not joint in path';
  }
};

Path.prototype.getWaypoints = function() {
  return this.entities.wps;
};

Path.prototype.getWidth = function() {
  return this.options.width;
};

Path.prototype.reverse = function() {
  this.entities.wps = Lazy(this.entities.wps).reverse().toArray();
};

Path.defaults = {
  width: 0.2,
  radius: 4
};
Path.id = 0;
Path.type = 'path';

module.exports = Path;

},{"./Entity":8,"./Joint":10}],12:[function(require,module,exports){

var Vec2 = require('../Common/Vec2');
var Entity = require('./Entity');
var Joint = require('./Joint');

var Wall = function(x, y, parent, options) {
  Entity.call(this, x, y, parent);
  this.id = 'W' + Wall.id++;
  this.options = Lazy(options).defaults(Wall.defaults).toObject();
  this.entities.corners = [];
  if (x && y) {
    this.addCorner(x, y);
  }
};

Wall.prototype.destroy = function() {
  Lazy(this.entities.corners).each(function(j) {
    j.destroy();
  });
  this.entities.corners.length = 0;
  Entity.prototype.destroy.call(this);
};

Wall.prototype.addEntity = function(joint) {
  this.entities.corners.push(joint);
};

Wall.prototype.removeEntity = function(joint) {
  var idx = this.entities.corners.indexOf(joint);
  if (idx !== -1) {
    this.entities.corners.splice(idx, 1);
    if (this.entities.corners.length === 0) {
      this.destroy();
    }
  } else {
    throw 'Joint not found in wall';
  }
};

Wall.prototype.addCorners = function(corner) {
  // n joints, n-1 sections
  for (var i in corner) {
    var p = corner[i];
    this.addCorner(p[0], p[1]);
  }
};

Wall.prototype.addCorner = function(x, y) {
  Entity.prototype.updatePos.call(this, x, y);
  var joint = new Joint(x, y, this, {radius: this.getCornerWidth()});
  return joint;
};

Wall.prototype.getCorners = function() {
  return this.entities.corners;
};

Wall.prototype.getCornerWidth = function() {
  return this.options.width * 2;
};

Wall.prototype.getWidth = function() {
  return this.options.width;
};

Wall.prototype.getProjection = function(point, segment) {
  if (segment < 0 || segment >= this.entities.corners.length - 1) {
    throw 'Segment out of bounds';
  }
  var projection = Vec2.create();
  return Vec2.projectionToSegment(projection, point, this.entities.corners[segment].pos, this.entities.corners[segment + 1].pos);
};

Wall.defaults = {
  width: 0.2
};
Wall.id = 0;
Wall.type = 'wall';

module.exports = Wall;

},{"../Common/Vec2":4,"./Entity":8,"./Joint":10}],13:[function(require,module,exports){
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
  Hover: 0xebff00,
  Context: 0x646729,
  Agent: 0xFF0000,
  Group: 0xFFFFFF,
  Wall: 0x00FF00,
  Joint: 0xAAAAAA,
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
var ContextModel = require('../Entities/Context');
var Colors = Base.Colors;

var Context = function(context) {
  if (!context) {
    throw 'Context object must be defined';
  }
  Entity.call(this, context);
};

Context.CreateFromModel = function(context) {
  return new Context(context);
};

Context.CreateFromPoint = function(x, y, parent, options) {
  var context = new ContextModel(x, y, parent, options);
  return new Context(context);
};

Context.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Context.container, this.graphics);
  Entity.prototype.destroy.call(this);
};

Context.prototype.createGraphics = function(context) {
  this.graphics = Entity.prototype.createGraphics.call(this,Context.container);
  this.rect = new PIXI.Rectangle(0, 0, 0, 0);
  this.rect.entityModel = context;
  this.label = new PIXI.Text(context.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  this.graphics.entity = this;
};

Context.prototype.getAnchor = function(init) {
  var context = this.entityModel;
  return {x: context.pos[0], y: context.pos[1]};
};

Context.prototype.dragTo = function(pos, anchor) {
  var context = this.entityModel;
  context.pos[0] = pos.x;
  context.pos[1] = pos.y;
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
    this.rect.x = context.pos[0] - w / 2;
    this.rect.y = context.pos[1] - h / 2;
    this.rect.width = w;
    this.rect.height = h;
    this.label.x = context.pos[0] - this.label.width / 2;
    this.label.y = context.pos[1] - this.label.height / 2;
    this.graphics.beginFill(this.hover ? Colors.Hover : Colors.Context, this.hover ? 0.9 : 0.3);
    this.graphics.drawShape(this.rect);
    this.graphics.endFill();
  }
};

Context.prototype.setArea = function(x, y) {
  this.entityModel.setArea(x, y);
};

Context.detail = new Detail(2);

module.exports = Context;

},{"../Entities/Context":7,"./Base":14,"./Detail":16,"./Entity":17}],16:[function(require,module,exports){
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
  this.entityModel.view = this;
  this.selected = false;
};

Entity.prototype.destroy = function() {
  this.entityModel.view = null;
  this.entityModel.destroy();
  this.entityModel = null;
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
    //graphics.clear();
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

Entity.mousedown = null;
Entity.mousemove = null;
Entity.mouseup = null;
Entity.mouseover = null;
Entity.mouseout = null;

module.exports = Entity;

},{"./Base":14}],18:[function(require,module,exports){
'use strict';

var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;
var GroupModel = require('../Entities/Group');

var Group = function(group) {
  if (!group) {
    throw 'Group object must be defined';
  }
  Entity.call(this, group);
};

Group.CreateFromModel = function(group) {
  return new Group(group);
};

Group.CreateFromPoint = function(x, y, parent, options) {
  var group = new GroupModel(x, y, parent, options);
  return new Group(group);
};

Group.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this,Group.container, this.graphics);
  Entity.prototype.destroy.call(this);
};

Group.prototype.createGraphics = function(group) {
  this.graphics = Entity.prototype.createGraphics.call(this,Group.container);
  this.label = new PIXI.Text(group.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.circle = new PIXI.Circle(0, 0, this.label.width, this.label.height);
  this.circle.entityModel = group;
  this.graphics.addChild(this.label);
  this.graphics.entity = this;
};

Group.prototype.render = function(options) {
  if (!Group.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this,this.graphics);
  var group = this.entityModel;
  // init render
  if (!this.graphics && Group.detail.level) {
    this.createGraphics(group);
  } else {
    this.graphics.clear();
  }

  if (Group.detail.level > 0) {
    this.label.x = group.pos[0] - this.label.width / 2;
    this.label.y = group.pos[1] - this.label.height / 2;
    this.circle.x = group.pos[0];
    this.circle.y = group.pos[1];
    this.graphics.beginFill(this.hover ? Colors.Hover : Colors.Group, this.hover ? 0.9 : 0.3);
    this.graphics.drawShape(this.circle);
    this.graphics.endFill();
    var entities = group.entities;
    for (var i in entities) {
      if (entities[i]) {
        var subEntity = entities[i];
        this.graphics.lineStyle(0.2, Colors.Group, 0.4);
        this.graphics.moveTo(group.pos[0],group.pos[1]);
        this.graphics.lineTo(subEntity.pos[0],subEntity.pos[1]);
      }
    }
  }
};

Group.prototype.getAnchor = function(init) {
  var group = this.entityModel;
  return {x: group.pos[0], y: group.pos[1]};
};

Group.prototype.dragTo = function(pos, anchor) {
  var group = this.entityModel;
  group.pos[0] = pos.x;
  group.pos[1] = pos.y;
};

Group.detail = new Detail(2);

module.exports = Group;

},{"../Entities/Group":9,"./Base":14,"./Detail":16,"./Entity":17}],19:[function(require,module,exports){
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
  this.graphics.removeChild(this.label);
  this.label.destroy();
  Entity.prototype.destroyGraphics.call(this, this.graphics , this.sprite);
  Entity.prototype.destroy.call(this);
};

Joint.prototype.createGraphics = function(graphics) {
  this.graphics = graphics;
  var joint = this.entityModel;
  this.sprite = new PIXI.Sprite(this.texture);
  Entity.prototype.createGraphics.call(this, graphics, this.sprite);
  this.label = new PIXI.Text(joint.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  graphics.addChild(this.label);
  this.sprite.anchor.x = 0.5;
  this.sprite.anchor.y = 0.5;
  this.sprite.entity = this;
  this.sprite.alpha = 0.5;
  this.render();
};

Joint.prototype.render = function() {
  this.sprite.x = this.entityModel.pos[0];
  this.sprite.y = this.entityModel.pos[1];
  this.sprite.width = 2 * this.entityModel.getRadius();
  this.sprite.height = 2 * this.entityModel.getRadius();
  this.sprite.tint = this.hover ? Colors.Hover : Colors.Joint;
  this.label.x = this.sprite.x;
  this.label.y = this.sprite.y;
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

},{"../Common/Vec2":4,"./Base":14,"./Detail":16,"./Entity":17}],20:[function(require,module,exports){
'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;
var PathModel = require('../Entities/Path');

var Path = function(path) {
  if (!path) {
    throw 'Path object must be defined';
  }
  Entity.call(this, path);
};

Path.CreateFromModel = function(path) {
  return new Path(path);
};

Path.CreateFromPoint = function(x, y, parent, options) {
  var path = new PathModel(x, y, parent, options);
  return new Path(path);
};

Path.prototype.destroy = function() {
  this.graphics.removeChild(this.label);
  this.label.destroy();
  Entity.prototype.destroyGraphics.call(this, Path.container, this.graphics);
  this.destroyGraphics(Path.container);
  Entity.prototype.destroy.call(this);
};

Path.prototype.createGraphics = function(path) {
  this.graphics = Entity.prototype.createGraphics.call(this, Path.container);
  this.label = new PIXI.Text(path.id, Base.Fonts.default);
  this.label.resolution = Base.Fonts.resolution;
  this.graphics.addChild(this.label);
  var wps = path.getWaypoints();
  this.label.x = wps[0].pos[0] - this.label.width / 2;
  this.label.y = wps[0].pos[1] - this.label.height / 2;
  if (wps && wps.length > 0) {
    for (var i in wps) {
      this.addWaypointFromModel(wps[i]);
    }
  }
};

Path.prototype.addWaypointFromModel = function(joint) {
  var renderJoint = new Joint(joint, Path.texture);
  renderJoint.createGraphics(this.graphics);
  return renderJoint;
};

Path.prototype.addWaypoint = function(x, y) {
  var path = this.entityModel;
  var wp = path.addWaypoint(x, y);
  return this.addWaypointFromModel(wp);
};

Path.prototype.render = function(options) {
  if (!Path.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this, this.graphics);
  var path = this.entityModel;
  var wps = path.getWaypoints();
  // init render
  if (!this.graphics && Path.detail.level > 0) {
    this.createGraphics(path);
  } else {
    this.graphics.clear();
  }

  if (Path.detail.level > 0) {
    var points  = [];
    this.label.x = wps[0].pos[0] - this.label.width / 2;
    this.label.y = wps[0].pos[1] - this.label.height / 2;
    this.graphics.lineStyle(path.getWidth(), this.hover ? Colors.Hover : Colors.Path, 0.6);
    for (var i = 0; i < wps.length; i++) {
      points.push(wps[i].pos[0], wps[i].pos[1]);
      wps[i].view.render();
    }
    this.graphics.drawPolygon(points);
  }
  if (Path.detail.level > 1) {
  }
};

Path.texture = null; // paths joint texture
Path.detail = new Detail(2);

module.exports = Path;

},{"../Entities/Path":11,"./Base":14,"./Detail":16,"./Entity":17,"./Joint":19}],21:[function(require,module,exports){
'use strict';

var Render = {
  Agent: require('./Agent'),
  Entity: require('./Entity'),
  Group: require('./Group'),
  Context: require('./Context'),
  Path: require('./Path'),
  Wall: require('./Wall')
};

module.exports = Render;

},{"./Agent":13,"./Context":15,"./Entity":17,"./Group":18,"./Path":20,"./Wall":22}],22:[function(require,module,exports){
'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;
var Fonts = Base.Fonts;
var WallModel = require('../Entities/Wall');

var Wall = function(wall) {
  if (!wall) {
    throw 'Wall object must be defined';
  }
  Entity.call(this, wall, Wall.container);
};

Wall.CreateFromModel = function(wall) {
  return new Wall(wall);
};

Wall.CreateFromPoint = function(x, y, parent, options) {
  var wall = new WallModel(x, y, parent, options);
  return new Wall(wall);
};

Wall.prototype.destroy = function() {
  Entity.prototype.destroyGraphics.call(this, Wall.container, this.graphics);
  this.destroyGraphics(Wall.container);
  Entity.prototype.destroy.call(this);
};

Wall.prototype.createGraphics = function(wall) {
  this.graphics = Entity.prototype.createGraphics.call(this, Wall.container);
  var corners = wall.getCorners();
  for (var j in corners) {
    this.addWaypointFromModel(corners[j]);
  }
};

Wall.prototype.addWaypointFromModel = function(joint) {
  var renderJoint = new Joint(joint, Wall.texture);
  renderJoint.createGraphics(this.graphics);
  return renderJoint;
};

Wall.prototype.addCorner = function(x, y) {
  var wall = this.entityModel;
  var j = wall.addCorner(x, y);
  return this.addWaypointFromModel(j);
};

Wall.prototype.render = function(options) {
  if (!Wall.detail.level) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this, this.graphics);
  var wall = this.entityModel;
  var corners = wall.getCorners();

  // init render
  if (!this.graphics && Wall.detail.level > 0) {
    this.createGraphics(wall);
  } else {
    this.graphics.clear();
    // color on hover
  }

  if (Wall.detail.level > 0) {
    this.graphics.lineStyle(wall.getWidth(), this.hover ? Colors.Hover : Colors.Wall);
    var points = [];
    for (var i = 0; i < corners.length; i++) {
      points.push(corners[i].pos[0], corners[i].pos[1]);
      corners[i].view.render();
    }
    this.graphics.drawPolygon(points);
  }
  if (Wall.detail.level > 1) {
  }
};
Wall.texture = null; // wall joints texture
Wall.detail = new Detail(2);

module.exports = Wall;

},{"../Entities/Wall":12,"./Base":14,"./Detail":16,"./Entity":17,"./Joint":19}],23:[function(require,module,exports){
'use strict';
/* global CrowdSim */

var World = function(x, y, width, height) {
  var that = this;
  this.agents = [];

  this.entities = {
    contexts: [],
    groups: [],
    paths: [],
    walls: []
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
  return this.entities.groups[0];
};

World.prototype.getGroups = function() {
  return this.entities.groups;
};

World.prototype.getAgents = function() {
  return this.agents;
};

World.prototype.addAgents = function(agents) {
  this.agents = this.agents.concat(agents);
  if (this.onCreateAgents) {
    this.onCreateAgents(agents);
  }
};

World.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.agents.indexOf(agents[i]);
    this.agents.splice(j,1);
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

World.prototype._getEntityList = function(entity) {
  if (entity instanceof CrowdSim.Context) { // is context
    return this.entities.contexts;
  } else if (entity instanceof CrowdSim.Group) { // is group
    return this.entities.groups;
  } else if (entity instanceof CrowdSim.Path) { // is path
    return this.entities.paths;
  } else if (entity instanceof CrowdSim.Wall) { // is wall
    return this.entities.walls;
  } else {
    throw 'Entity object is not context, group, wall or path';
  }
};

World.prototype.removeEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  var idx = entityList.indexOf(entity);
  entityList.splice(idx,1);
  this._onDestroy(entity);
};

World.prototype.addEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  entityList.push(entity);
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

World.prototype.save = function() {
  this.agentsSave = JSON.stringify(this.agents);
};
World.prototype.restore = function() {
  this.agents = JSON.parse(this.agentsSave);
};

// TODO add spatial structure to optimize this function
World.prototype.getNeighbours = function(agent) {
  return this.agents;
};

// TODO add spatial structure to optimize this function
World.prototype.getNearWalls = function(agent) {
  return this.entities.walls;
};

// TODO add spatial structure to optimize this function
World.prototype.agentsInContext = function(context, agents) {
  if (!agents) {
    agents = this.agents;
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