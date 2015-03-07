
Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.agentsSave = JSON.parse(JSON.stringify(world.agents));
  this.world = world || {};
  this.world.save();

  var defaultOptions = {
    step: 60
  };
  this.options = Lazy(options).defaults(defaultOptions).toObject();
};

Engine.prototype.setWorld = function(world) {
  this.world = world;
};

Engine.prototype.getWorld = function() {
  return this.world;
};

Engine.prototype.run = function() {
  if (this.running) {
    return;
  }
  this.running = true;
  this._step();
};

Engine.prototype.step = function() {
  if (this.running) {
    return;
  }
  this._step();
};

Engine.prototype._step = function() {
  if (this.world && this.world.agents) {
    for (var i in this.world.agents) {
      var entity = this.world.agents[i];
      if (entity.selected) {
        this.world.entitySelected = entity;
        continue;
      }
      entity.acceleration.x = (Math.random() - 0.5) / 1000;
      entity.acceleration.y = (Math.random() - 0.5) / 1000;
      entity.velocity.x += entity.acceleration.x * this.options.step;
      entity.velocity.y += entity.acceleration.y * this.options.step;
      entity.direction = Math.atan2(entity.velocity.y, entity.velocity.x);
      entity.position.x += entity.velocity.x * this.options.step;
      entity.position.y += entity.velocity.y * this.options.step;

      if (this.world.wrap) {
        if (entity.position.x > this.world.MAX_X) {
          entity.position.x = this.world.MIN_X + entity.position.x - this.world.MAX_X;
        }
        if (entity.position.x < this.world.MIN_X) {
          entity.position.x = this.world.MAX_X - (this.world.MIN_X - entity.position.x);
        }
        if (entity.position.y > this.world.MAX_Y) {
          entity.position.y = this.world.MIN_Y + entity.position.y - this.world.MAX_Y;
        }
        if (entity.position.y < this.world.MIN_Y) {
          entity.position.y = this.world.MAX_Y - (this.world.MIN_Y - entity.position.y);
        }
      }
      if (this.options.onStep) {
        this.options.onStep(this);
      }
    }
  }
  this.iterations++;
  if (this.running) {
    var that = this;
    setTimeout(function() {
      that._step();
    }, this.STEP);
  }
};

Engine.prototype.stop = function() {
  if (!this.running) {
    return;
  }
  this.running = false;
};
Engine.prototype.reset = function() {
  this.iterations = 0;
  this.running = false;
  this.world.restore();
};

module.exports = Engine;
