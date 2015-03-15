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
