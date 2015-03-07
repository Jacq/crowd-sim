
var AgentRender = function(agent, stage) {
  this.agent = agent;
  var graphics = new PIXI.Graphics();
  // add it the stage so we see it on our screens..
  this.graphics = graphics;
  this.graphics._entity = this;
  this.circle = new PIXI.Circle(agent.position.x, agent.position.y, agent.size * 2.5);
  this.text = new PIXI.Text(agent.id, {font: '12px Arial', fill: 'yellow'});
  this.text.position = agent.position;
  this.text.anchor.x = 0.5;
  this.text.anchor.y = 0.5;
  this.graphics.drawShape(this.circle);

  this.graphics.interactive = true;
  this.graphics.buttonMode = true;
  this.graphics.mouseover = this.mouseover;
  this.graphics.mouseout = this.mouseout;
  stage.addChild(this.graphics);
  stage.addChild(this.text);
};

AgentRender.prototype.mouseover = function() {
  var agent = this._entity.agent;
  console.log(agent.id + ': Mouse Over');
  agent.selected = true;
};
AgentRender.prototype.mouseout = function() {
  this._entity.agent.selected = false;
};

AgentRender.prototype.render = function() {
  this.clear();
  var e = this.agent;
  // begin a green fill..
  this.graphics.lineStyle(1, 0xFF0000);
  // draw a triangle using lines
  this.circle.x = e.position.x;
  this.circle.y = e.position.y;
  this.graphics.beginFill(0x660000);
  this.graphics.drawShape(this.circle);
  this.graphics.moveTo(e.position.x, e.position.y);
  var endX = Math.cos(e.direction);
  var endY = Math.sin(e.direction);
  this.graphics.lineTo(e.position.x + endX * e.size * 2,
    e.position.y + endY * e.size * 2);
  //console.log(e);
};

AgentRender.prototype.clear = function() {
  this.graphics.clear();
};

module.exports = AgentRender;
