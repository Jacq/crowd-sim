(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* global window,module, exports : true, define */

var CrowdSim = {
  Entity: require('./Entity'),
  World: require('./World'),
  Engine: require('./Engine')
};

module.exports = CrowdSim;

// browser
if (typeof window === 'object' && typeof window.document === 'object') {
  window.CrowdSim = CrowdSim;
}

},{"./Engine":2,"./Entity":3,"./World":4}],2:[function(require,module,exports){

Engine = function(world, options) {
  this.running = false;
  this.iterations = 0;
  //this.entitiesSave = JSON.parse(JSON.stringify(world.entities));
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
  if (this.world && this.world.entities) {
    for (var i in this.world.entities) {
      var entity = this.world.entities[i];
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

},{}],3:[function(require,module,exports){
/* global window,module, exports : true, define */

Entity = function(id, x, y, size, direction) {
  this.id = id;
  this.position = {
    x: x,
    y: y
  };
  this.velocity = {
    x: 0,
    y: 0
  };
  this.acceleration = {
    x: 0,
    y: 0
  };
  this.size = size;
  this.direction = direction;
  this.view = {};
};

module.exports = Entity;

},{}],4:[function(require,module,exports){
/* global window,module, exports : true, define */

World = function(w, h) {
  this.entities = [];
  this.wrap = true;
  this.MAX_X = w;
  this.MIN_X = 0;
  this.MAX_Y = h;
  this.MIN_Y = 0;
};

World.prototype.add = function(entity) {
  this.entities.push(entity);
};
World.prototype.save = function() {
  this.entitiesSave = JSON.stringify(this.entities);
};
World.prototype.restore = function() {
  this.entities = JSON.parse(this.entitiesSave);
};

module.exports = World;

},{}]},{},[1])


//# sourceMappingURL=CrowdSim.js.map