'use strict';

var Agent = require('./Agent');
var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Group = function(agentsNumber, world, initArea, options) {
  Entity.call(this);
  this._initArea = initArea;
  options = Lazy(options).defaults({
    pos: function(area) {
      var x = area[0][0] + Math.random() * (area[1][0] - area[0][0]);
      var y = area[0][1] + Math.random() * (area[1][1] - area[0][1]);
      return Vec2.fromValues(x, y);
    },
    size: function() {
      return 0.5;
    },
    behavior: this.behaviorRandom,
  }).toObject();
  this.id = Group.id++;

  this.behavior = options.behavior;
  this.world = world;
  this.step = 1.0;
  var that = this;
  this.agents = [];
  for (var i = 0; i < agentsNumber; i++) {
    var pos = options.pos(initArea);
    var size = isNaN(options.size) ? options.size() : options.size;
    var agent = new Agent(that, pos[0], pos[1], size);
    this.agents.push(agent);
  }

  if (options) {
    if (options.path) {
      this.assignPath(options.path);
    }
  }

};

Group.prototype.assignPath = function(path) {
  for (var i  in this.agents) {
    this.agents[i].followPath();
  }
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

/**
 * Helbing-Farkas,Vicsek Simulating dynamical features of escape panic
 *
 * @param  {Agent} agent [description]
 * {Vec2}       [description]
 */
Group.prototype.behaviorRandom = function(agent) {
  var desiredForce = Vec2.create();
  var agentsForce = Vec2.create();
  var wallsForce = Vec2.create();
  var accel = Vec2.create();

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

  // check agent desired force
  Vec2.add(accel, agentsForce, wallsForce);
  if (agent.target) { // agent is going somewhere?
    var pos = agent.pos;
    var target = agent.target; // path point, point, other agent {point , radius}
    var distanceToTarget = Vec2.distance(agent.pos, target.point);
    if (distanceToTarget > target.radius) {
      desiredForce = Vec2.create();
      Vec2.subtract(desiredForce, target.point, agent.pos);
      Vec2.normalize(desiredForce, desiredForce);
    }
  } else {
    // fix to stay in place if no target is selected
    Vec2.negate(desiredForce, agent.vel);
    if (Vec2.length(desiredForce) > agent.maxVel) {
      Vec2.normalizeAndScale(desiredForce, desiredForce, agent.maxVel);
    }
  }

  Vec2.add(accel, accel, desiredForce);
  // return desiredForce + agentsForce + wallsForce;
  if (agent.debug) {
    agent.debug.desiredForce = desiredForce;
    agent.debug.agentsForce = agentsForce;
    agent.debug.wallsForce = wallsForce;
  }
  //console.log(Vec2.str(desiredForce) + '|' + Vec2.str(agentsForce) + '|' + Vec2.str(wallsForce));
  return accel;
};
var A = 2e3, // N
  B = 0.08, // m
  kn = 1.2e5, // kg s-2
  Kv = 2.4e5; //kg m-1 s-1

Group.prototype.calculateAgentForce = function(i, j) {
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
  Vec2.scale(interactionForce, nijV2, A * Math.exp(rdij * B));

  if (rdij > 0) { // agents touch each other
    // ij tangencial velocity
    Vec2.scaleAndAdd(interactionForce,interactionForce, nijV2, kn * rdij); // body force
    // sliding friction
    var vjiV2 = Vec2.create();
    Vec2.subtract(vjiV2, j.vel, i.vel);
    var deltaVji = Vec2.dot(vjiV2, tijV2);
    Vec2.scaleAndAdd(interactionForce,interactionForce, tijV2, Kv * rdij * deltaVji);
  }
  return interactionForce;
};

Group.prototype.calculateWallForce = function(i, projection, width) {
  var interactionForce = Vec2.create();
  var rij = i.size + width;
  // ij direction
  var nijV2 = projection;
  var dij = Vec2.length(projection);
  Vec2.scale(nijV2, nijV2, 1 / dij);
  // ij tangencial direction
  var tijV2 = Vec2.fromValues(-nijV2[1], nijV2[0]);

  var rdij = rij - dij;
  Vec2.scale(interactionForce, nijV2, A * Math.exp(rdij * B));
  if (rdij > 0) { // agents touch each other
    // ij tangencial velocity
    var vjiV2 = Vec2.create();
    var dotViT = Vec2.dot(i.vel, tijV2);
    Vec2.scaleAndAdd(interactionForce,interactionForce, nijV2, kn * rdij); // body force
    Vec2.scaleAndAdd(interactionForce,interactionForce, tijV2, -Kv * rdij * dotViT);
  }
  return interactionForce;
};

Group.id = 0;

module.exports = Group;
