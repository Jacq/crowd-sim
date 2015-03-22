
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
var Entity = function(entity, stage) {
  this.entitiyModel = entity;
  this.entitiyModel.extra.view = this;
  this.graphics = new PIXI.Graphics();
  // add it the stage so we see it on our screens..
  this.graphics.interactive = true;
  this.graphics.buttonMode = true;
  this.graphics.mouseover = this.mouseover;
  this.graphics.mouseout = this.mouseout;
  this.graphics._entityView = this;
  stage.addChild(this.graphics);
};

Entity.prototype.render = function() {
  //this.graphics.clear();
};

Entity.prototype.mouseover = function() {
  var entity = this._entityView.entityModel;
  console.log(entity.id + ': Mouse Over');
  agent.selected = true;
};

Entity.prototype.mouseout = function() {
  this._entityView.entityModel.selected = false;
};

var Agent = function(agent, stage) {
  Entity.call(this, agent, stage);

  this.graphics.beginFill(Colors.Agent);
  this.circle = new PIXI.Circle(agent.pos.x, agent.pos.y, agent.size);
  this.text = new PIXI.Text(agent.id, {font: '12px Arial', fill: 'yellow'});
  this.text.pos = agent.pos;
  this.text.anchor.x = 0.5;
  this.text.anchor.y = 0.5;
  this.render();
};

Agent.prototype.render = function() {
  if (!Agent.show || !Agent.show.all) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this);
  this.graphics.clear();
  var e = this.entitiyModel;
  // direction line
  var scale = 10;
  this.circle.x = e.pos.x;
  this.circle.y = e.pos.y;

  if (Agent.show.body) {
    this.graphics.beginFill(Colors.Agent);
    this.graphics.drawShape(this.circle);
    this.graphics.lineStyle(1, Colors.Agent);
  }
  if (Agent.show.direction) {
    this.graphics.moveTo(e.pos.x, e.pos.y);
    this.graphics.lineTo(e.pos.x + e.vel.x * scale, e.pos.y + e.vel.y * scale);
    this.graphics.endFill();
  }
  //console.log(e);
};
Agent.show = {body: true, direction: true, all: true};

var Wall = function(wall, stage) {
  Entity.call(this, wall, stage);
  this.joints = [];
  for (var j in wall.path) {
    var joint = wall.path[j];
    var circle = new PIXI.Circle(joint[0], joint[1], wall.width);
    this.joints.push(circle);
  }
  this.render();
};

Wall.prototype.render = function(options) {
  if (!Wall.show || !Wall.show.all) {
    this.graphics.clear();
    return;
  }
  Entity.prototype.render.call(this);
  this.graphics.clear();
  var path = wall.path;
  if (Wall.show.path) {
    this.graphics.beginFill(Colors.Wall, 0.2);
    this.graphics.lineStyle(wall.width, Colors.Wall);
    this.graphics.moveTo(path[0][0], path[0][1]);
    for (var i = 1; i < path.length ; i++) {
      this.graphics.lineTo(path[i][0], path[i][1]);
    }
    this.graphics.endFill();
  }
  if (Wall.show.corners) {
    this.graphics.beginFill(Colors.Joint);
    for (var j in this.joints) {
      this.graphics.drawShape(this.joints[j]);
    }
    this.graphics.endFill();
  }
};
Wall.show = {path: true, corners: true, all: true};

var Group = function(group, stage) {
  Entity.call(this, group, stage);
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
  this.render();
};

Group.prototype.render = function(options) {
  if (!Group.show || !Group.show.all) {
    this.graphics.clear();
    return;
  }
  this.graphics.clear();
  Entity.prototype.render.call(this);
  var group = this.entitiyModel;
  this.graphics.clear();
  if (!group.agents || group.agents.length === 0) {
    return;
  }
  if (Group.show.area) {
    var limits = group.getArea();
    this.area.x = limits.xmin;
    this.area.y = limits.ymin;
    this.area.width = limits.xmax - limits.xmin;
    this.area.height = limits.ymax - limits.ymin;

    this.graphics.beginFill(Colors.Group, 0.3);
    this.graphics.drawShape(this.area);
    this.graphics.endFill();
  }
  var wps = this.waypoints;
  if (Group.show.waypoints && wps) {
    this.graphics.lineStyle(1, Colors.Group);
    this.graphics.beginFill(Colors.Joint);
    for (var i in wps) {
      this.graphics.drawShape(wps[i]);
    }
    this.graphics.endFill();
    //
    this.graphics.moveTo(wps[0].x, wps[0].y);
    for (var j = 1; j < wps.length; j++) {
      this.graphics.lineTo(wps[j].x, wps[j].y);
    }
  }
};

Group.show = {area: true, waypoints: true, all: true};

module.exports.Agent = Agent;
module.exports.Wall = Wall;
module.exports.Group = Group;
