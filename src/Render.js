
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
  this.graphics.clear();
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
  this.circle = new PIXI.Circle(agent.pos.x, agent.pos.y, agent.size);
  this.text = new PIXI.Text(agent.id, {font: '12px Arial', fill: 'yellow'});
  this.text.pos = agent.pos;
  this.text.anchor.x = 0.5;
  this.text.anchor.y = 0.5;
  this.graphics.drawShape(this.circle);
  //stage.addChild(this.text);
};

Agent.prototype.render = function() {
  Entity.prototype.render.call(this);
  var e = this.entitiyModel;
  // direction line
  this.graphics.lineStyle(1, Colors.Agent);
  this.circle.x = e.pos.x;
  this.circle.y = e.pos.y;
  this.graphics.beginFill(Colors.Agent);
  this.graphics.drawShape(this.circle);
  this.graphics.moveTo(e.pos.x, e.pos.y);
  var endX = Math.cos(e.direction);
  var endY = Math.sin(e.direction);
  var scale = 10;
  this.graphics.lineTo(e.pos.x + e.vel.x * scale, e.pos.y + e.vel.y * scale);
  //console.log(e);
};

var Wall = function(wall, stage) {
  Entity.call(this, wall, stage);
  this.joints = [];
  for (var i in wall.path) {
    var joint = wall.path[i];
    this.joints.push(new PIXI.Circle(joint[0], joint[1], wall.width));
  }
};

Wall.prototype.render = function() {
  Entity.prototype.render.call(this);
  var wall = this.entitiyModel;
  this.graphics.lineStyle(wall.width, Colors.Wall);
  var path = wall.path;
  this.graphics.moveTo(path[0][0], path[0][1]);
  for (var i = 1; i < path.length ; i++) {
    this.graphics.lineTo(path[i][0], path[i][1]);
  }
  for (var j = 0; j < this.joints ; j++) {
    this.graphics.drawShape(this.joints[j]);
  }

};

var Group = function(group, stage) {
  Entity.call(this, group, stage);
  var limits = group.getArea();
  this.area = new PIXI.Rectangle(limits.xmin, limits.ymin, limits.xmax - limits.xmin, limits.ymax - limits.ymin);
  if (group.waypoints) {
    this.waypoints = [];
    var wps = group.waypoints;
    this.graphics.beginFill(Colors.Joint);
    for (var i in wps) {
      var wp = wps[i];
      var circle = new PIXI.Circle(wp[0], wp[1], 1);
      this.waypoints.push(circle);
      this.graphics.drawShape(circle);
    }
  }
};

Group.prototype.render = function() {
  Entity.prototype.render.call(this);
  var group = this.entitiyModel;
  if (!group.agents || group.agents.length === 0) {
    return;
  }
  this.graphics.lineStyle(1, Colors.Group);
  var limits = group.getArea();
  this.area.x = limits.xmin;
  this.area.y = limits.ymin;
  this.area.width = limits.xmax - limits.xmin;
  this.area.height = limits.ymax - limits.ymin;
  this.graphics.drawShape(this.area);
  if (group.waypoints) {
    this.graphics.lineStyle(1, Colors.Waypoint);
    var wps = group.waypoints;
    this.graphics.moveTo(wps[0][0], wps[0][1]);
    for (var i = 1; i < wps.length; i++) {
      this.graphics.lineTo(wps[i][0], wps[i][1]);
    }

    for (var j = 0; j < this.waypoints.length; j++) {
      this.graphics.drawShape(this.waypoints[j]);
    }

  }
};

module.exports.Agent = Agent;
module.exports.Wall = Wall;
module.exports.Group = Group;
