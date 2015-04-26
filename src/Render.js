'use strict';

var Colors = {
  Agent: 0xFF0000,
  Wall: 0x00FF00,
  Group: 0xe1eca0,
  Joint: 0xFFFFFF,
  Path: 0xe00c7b,
  Waypoint: 0x7a7a7a
};

var Font = {
  default: {font: '2px Snippet', fill: 'white', align: 'left'}
};
/*
* Base render prototype
*/
var Entity = function(entity, container, display) {
  this.entityModel = entity;
  this.entityModel.extra.view = this;
  // add it the container so we see it on our screens..
  display.interactive = true;
  display.buttonMode = true;
  display.mouseover = this.mouseover;
  display.mouseout = this.mouseout;
  display._entityView = this;
  container.addChild(display);
  this.display = display;
};

Entity.prototype.render = function() {
  //this.display.clear();
};

Entity.prototype.mouseover = function() {
  var entity = this._entityView.entityModel;
  console.log(entity.id + ': Mouse Over');
  entity.selected = true;
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
  this.render();
};

Agent.prototype.render = function() {
  if (!Agent.show || !Agent.show.all) {
    return;
  }
  Entity.prototype.render.call(this);

  var e = this.entityModel;
  this.display.position.set(e.pos[0], e.pos[1]);
  this.display.rotation = Math.atan2(e.vel[1], e.vel[0]) - Math.PI / 2;
  if (this.circle) {
    this.graphics.clear();
    this.circle.x = e.pos[0];
    this.circle.y = e.pos[1];

    if (Agent.show.body) {
      this.graphics.lineStyle(0.1, Colors.Agent);
      this.graphics.drawShape(this.circle);
    }
    if (Agent.show.direction) {
      var scale = 10;
      this.graphics.moveTo(e.pos[0], e.pos[1]);
      this.graphics.lineTo(e.pos[0] + e.vel[0], e.pos[1] + e.vel[1]);
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
    var text = new PIXI.Text(j, Font.default);
    text.resolution = 12;
    text.x = joint[0];
    text.y = joint[1];
    display.addChild(text);
    this.joints.push(circle);
  }
  this.render();
};

Wall.prototype.render = function(options) {
  if (!Wall.show || !Wall.show.all) {
    this.display.clear();
    return;
  }
  Entity.prototype.render.call(this);
  //this.display.clear();
  var wall = this.entityModel;
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
  if (Wall.show.joints) {
    this.display.beginFill(Colors.Joint);
    for (var j in this.joints) {
      this.display.drawShape(this.joints[j]);
    }
    this.display.endFill();
  }
};
Wall.show = {path: true, joints: true, all: true};

var Group = function(group, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, group, container, display);
  this.area = new PIXI.Rectangle(0, 0, 0, 0);
  this.render();
};

Group.prototype.render = function(options) {
  if (!Group.show || !Group.show.all) {
    this.display.clear();
    return;
  }
  this.display.clear();
  Entity.prototype.render.call(this);
  var group = this.entityModel;
  if (!group.agents || group.agents.length === 0) {
    return;
  }
  if (Group.show.area) {
    var limits = group.getInitArea();
    this.area.x = limits[0][0];
    this.area.y = limits[0][1];
    this.area.width = limits[1][0] - limits[0][0];
    this.area.height = limits[1][1] - limits[0][1];

    this.display.beginFill(Colors.Group, 0.2);
    this.display.drawShape(this.area);
    this.display.endFill();
  }
};

Group.show = {area: true, waypoints: true, all: true};

var Path = function(path, container) {
  var display = new PIXI.Graphics();
  Entity.call(this, path, container, display);
  var wps = path.wps;
  if (wps && wps.length > 0) {
    this.joints = [];
    for (var i in wps) {
      var circle = new PIXI.Circle(wps[i][0], wps[i][1], path.width);
      this.joints.push(circle);
    }
  }
  this.render();
};

Path.prototype.render = function(options) {
  if (!Path.show || !Path.show.all) {
    this.display.clear();
    return;
  }
  Entity.prototype.render.call(this);
  var path = this.entityModel;
  if (Path.show.joints && this.joints && this.joints.length > 0) {
    this.display.lineStyle(0.1, Colors.Path);
    this.display.moveTo(this.joints[0].x, this.joints[0].y);
    for (var lj = 1; lj < this.joints.length; lj++) {
      this.display.lineTo(this.joints[lj].x, this.joints[lj].y);
    }
    this.display.beginFill(Colors.Joint);
    for (var j in this.joints) {
      this.display.drawShape(this.joints[j]);
    }
    this.display.endFill();

  }
};

Path.show = {path: true, joints: true, all: true};

module.exports.Path = Path;
module.exports.Agent = Agent;
module.exports.Wall = Wall;
module.exports.Group = Group;
