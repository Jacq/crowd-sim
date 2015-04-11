var Agent = require('./Agent');
var Entity = require('./Entity');
var Vec2 = require('./Vec2');

var Group = function(world, agentsNumber, initArea, options) {
  Entity.call(this);
  options = Lazy(options).defaults({
    pos: function(area) {
      var x = area[0][0] + Math.random() * (area[1][0] - area[0][0]);
      var y = area[0][1] + Math.random() * (area[1][1] - area[0][1]);
      return Vec2.fromValues(x, y);
    },
    size: function() {
      return 5;
    },
    behavior: this.behaviorRandom,
  }).toObject();
  this.id = Group.id++;

  this.behavior = options.behavior;
  this.world = world;
  var that = this;
  this.agents = [];
  for (var i=0;i<agentsNumber;i++) {
    var pos = options.pos(initArea);
    var size = isNaN(options.size) ? options.size() : options.size;
    var agent = new Agent(that, pos[0], pos[1], size);
    this.agents.push(agent);
  }

  if (options.waypoints) {
    this.waypoints = options.waypoints;
  }
};

Group.prototype.addAgent = function(x,y) {
  var size = isNaN(options.size) ? options.size() : options.size;
  var agent = new Agent(this, x, y, size);
  this.agents.push(agent);
};

Group.prototype.getArea = function() {
  return {
    xmin: Lazy(this.agents).map(function(e) { return e.pos[0] - e.size; }).min(),
    xmax: Lazy(this.agents).map(function(e) { return e.pos[0] + e.size; }).max(),
    ymin: Lazy(this.agents).map(function(e) { return e.pos[1] - e.size; }).min(),
    ymax: Lazy(this.agents).map(function(e) { return e.pos[1] + e.size; }).max()
  };
};

Group.prototype.addAgent = function(agent) {
  this.agents.concat(agent);
};


Group.prototype.behaviorRandom = function(agent, step) {
  var accel = Vec2.fromValues(Math.random() * 2 - 1, Math.random() * 2 - 1);
  var vel = Vec2.create();
  var pos = Vec2.create();
  Vec2.scale(vel,accel,step);
  Vec2.add(agent.vel,agent.vel,vel);
  //this.direction = Math.atan2(entity.vel.y, entity.vel.x);
  Vec2.scale(pos,agent.vel,step);
  Vec2.add(agent.pos,agent.pos,pos);

  if (this.world.wrap) {
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
  }
};

Group.id = 0;

module.exports = Group;
