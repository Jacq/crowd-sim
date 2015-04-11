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
