
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
  container.addChild(display);
  this.display = display;
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

var Agent = function(agent, container, texture, debugContainer) {
  var sprite = new PIXI.Sprite(texture);
  if (debugContainer) {
    this.graphics = new PIXI.Graphics();
    debugContainer.addChild(this.graphics);
    this.circle = new PIXI.Circle(agent.pos[0], agent.pos[1], agent.size / 2);
  }
  //var display = new PIXI.Sprite(options.texture);
  Entity.call(this, agent, container, sprite);
  this.display.visible = Agent.show.body;
  this.display.anchor.set(0.5);
  //this.display.alpha = 0.5;
  this.display.height = agent.size;
  this.display.width = agent.size;
  this.display.position.x = agent.pos[0];
  this.display.position.y = agent.pos[1];
  this.update();
};

Agent.prototype.update = function() {
  if (!Agent.show || !Agent.show.all) {
    return;
  }
  Entity.prototype.update.call(this);

  var e = this.entitiyModel;
  this.display.position.set(e.pos[0], e.pos[1]);
  this.display.rotation = Math.atan2(e.vel[1], e.vel[0]) - Math.PI / 2;
  if (this.circle) {
    this.graphics.clear();
    this.circle.x = e.pos[0];
    this.circle.y = e.pos[1];

    if (Agent.show.body) {
      this.graphics.lineStyle(1, Colors.Agent);
      this.graphics.drawShape(this.circle);
    }
    if (Agent.show.direction) {
      var scale = 10;
      this.graphics.moveTo(e.pos[0], e.pos[1]);
      this.graphics.lineTo(e.pos[0] + e.vel[0] * scale, e.pos[1] + e.vel[1] * scale);
      this.graphics.endFill();
    }
  }

};
Agent.show = {body: true, direction: true, all: true};

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
module.exports.Wall = Wall;
module.exports.Group = Group;
