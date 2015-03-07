var Agent = require('./Agent');

Group = function(id, agents, area, options) {
  Lazy(options).defaults({
    position: function(area) {
      var x = area[0] + Math.random() * area[2];
      var y = area[1] + Math.random() * area[3];
      return [x, y];
    },
    size: function() {
      return Math.random() * 5;
    }
  }).toObject();
  this.id = id;
  this.agentList = [];

  for (var i = 0; i < agents; i++) {
    var position = options.position();
    var size = options.size();
    var agent = new Agent(id + ':' + i, position[0], position[1], size);
    this.agentList.push(agent);
  }
};

module.exports = Group;
