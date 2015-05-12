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
