
var Colors = {
  Agent: 0xFF0000,
  Wall: 0x00FF00,
  Group: 0xe1eca0,
  Joint: 0xFFFFFF,
  Waypoint: 0x7a7a7a
};

/*
* Base render prototype
*/
var Entity = function(entity, container, display) {
  this.entitiyModel = entity;
  this.entitiyModel.extra.view = this;
  // add it the container so we see it on our screens..
  display.interactive = true;
  display.buttonMode = true;
  display.mouseover = this.mouseover;
  display.mouseout = this.mouseout;
  display._entityView = this;
  this.display = display;
  container.addChild(this.display);
};

Entity.prototype.update = function() {
  //this.display.clear();
};

Entity.prototype.mouseover = function() {
  var entity = this._entityView.entityModel;
  console.log(entity.id + ': Mouse Over');
  agent.selected = true;
};

Entity.prototype.mouseout = function() {
  this._entityView.entityModel.selected = false;
};

var Agent = function(agent, container, options) {
  var display = new PIXI.Graphics();
  Entity.call(this, agent, container, display);
  this.display.beginFill(Colors.Agent);
  this.circle = new PIXI.Circle(agent.pos.x, agent.pos.y, agent.size);

  this.update();
};

Agent.prototype.update = function() {
  if (!Agent.show || !Agent.show.all) {
    this.display.clear();
    return;
  }
  Entity.prototype.update.call(this);

  var e = this.entitiyModel;
  // direction line
  var scale = 10;
  this.circle.x = e.pos.x;
  this.circle.y = e.pos.y;

  if (Agent.show.body) {
    this.display.beginFill(Colors.Agent);
    this.display.drawShape(this.circle);
    this.display.lineStyle(1, Colors.Agent);
  }
  if (Agent.show.direction) {
    this.display.moveTo(e.pos.x, e.pos.y);
    this.display.lineTo(e.pos.x + e.vel.x * scale, e.pos.y + e.vel.y * scale);
    this.display.endFill();
  }
  //console.log(e);
};
Agent.show = {body: true, direction: true, all: true};

var AgentSprite = function(agent, container, texture) {
  var sprite = new PIXI.Sprite(texture);
  //var display = new PIXI.Sprite(options.texture);
  Entity.call(this, agent, container, sprite);
  this.display.visible = Agent.show.body;
  this.display.anchor.set(0.5);
  //this.display.alpha = 0.5;
  this.display.height = agent.size;
  this.display.width = agent.size;
  this.display.position.x = agent.pos.x;
  this.display.position.y = agent.pos.y;
  this.update();
};

AgentSprite.prototype.update = function() {
  if (!Agent.show || !Agent.show.all) {
    return;
  }
  Entity.prototype.update.call(this);

  var e = this.entitiyModel;
  this.display.position.set(e.pos.x, e.pos.y);
  this.display.rotation = Math.atan2(e.vel.y, e.vel.x) - Math.PI / 2;
};
AgentSprite.show = {body: true, direction: true, all: true};

var Wall = function(wall, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, wall, container, display);
  this.joints = [];
  for (var j in wall.path) {
    var joint = wall.path[j];
    var circle = new PIXI.Circle(joint[0], joint[1], wall.width);
    this.joints.push(circle);
  }
  this.update();
};

Wall.prototype.update = function(options) {
  if (!Wall.show || !Wall.show.all) {
    this.display.clear();
    return;
  }
  Entity.prototype.update.call(this);
  //this.display.clear();
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
  if (Wall.show.corners) {
    this.display.beginFill(Colors.Joint);
    for (var j in this.joints) {
      this.display.drawShape(this.joints[j]);
    }
    this.display.endFill();
  }
};
Wall.show = {path: true, corners: true, all: true};

var Group = function(group, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, group, container, display);
  this.area = new PIXI.Rectangle(0, 0, 0, 0);
  var wps = group.waypoints;
  if (wps) {
    this.waypoints = [];
    for (var i in wps) {
      var wp = wps[i];
      var circle = new PIXI.Circle(wp[0], wp[1], 1);
      this.waypoints.push(circle);
    }
  }
  this.update();
};

Group.prototype.update = function(options) {
  if (!Group.show || !Group.show.all) {
    this.display.clear();
    return;
  }
  this.display.clear();
  Entity.prototype.update.call(this);
  var group = this.entitiyModel;
  if (!group.agents || group.agents.length === 0) {
    return;
  }
  if (Group.show.area) {
    var limits = group.getArea();
    this.area.x = limits.xmin;
    this.area.y = limits.ymin;
    this.area.width = limits.xmax - limits.xmin;
    this.area.height = limits.ymax - limits.ymin;

    this.display.beginFill(Colors.Group, 0.2);
    this.display.drawShape(this.area);
    this.display.endFill();
  }
  var wps = this.waypoints;
  if (Group.show.waypoints && wps) {
    this.display.lineStyle(1, Colors.Group);
    this.display.beginFill(Colors.Joint);
    for (var i in wps) {
      this.display.drawShape(wps[i]);
    }
    this.display.endFill();
    //
    this.display.moveTo(wps[0].x, wps[0].y);
    for (var j = 1; j < wps.length; j++) {
      this.display.lineTo(wps[j].x, wps[j].y);
    }
  }
};

Group.show = {area: true, waypoints: true, all: true};

module.exports.Agent = Agent;
module.exports.AgentSprite = AgentSprite;
module.exports.Wall = Wall;
module.exports.Group = Group;
