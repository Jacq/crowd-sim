'use strict';

var Context = require('./Entities/Context');
var Group = require('./Entities/Group');
var Path = require('./Entities/Path');
var Wall = require('./Entities/Wall');
var Grid = require('./Common/Grid');

var World = function(parent, options) {
  this.options = Lazy(options).defaults(World.defaults).toObject();
  var that = this;
  this.parent = parent;
  this.agents = [];

  this.entities = {
    contexts: [],
    groups: [],
    paths: [],
    walls: []
  };
  this.grid = new Grid(this.options.near);
  this.changes = 1;
  this.isFrozen = true;
};

World.prototype.getDefaultGroup = function() {
  return this.entities.groups[0];
};

World.prototype.getAgents = function() {
  return this.agents;
};

World.prototype.getEntitiesIterator = function() {
  return Lazy(this.entities).values().flatten();
};

World.prototype.getContexts = function() {
  return this.entities.contexts;
};

World.prototype.getGroups = function() {
  return this.entities.groups;
};

World.prototype.getPaths = function() {
  return this.entities.paths;
};

World.prototype.getWalls = function() {
  return this.entities.walls;
};

World.prototype.addAgents = function(agents) {
  this.agents = this.agents.concat(agents);
  this.grid.insert(agents);
  if (this.options.onCreateAgents) {
    this.options.onCreateAgents(agents);
  }
};

World.prototype.removeAgents = function(agents) {
  for (var i in agents) {
    var j = this.agents.indexOf(agents[i]);
    this.agents.splice(j, 1);
  }
  this.grid.remove(agents);
  if (this.options.onDestroyAgents) {
    this.options.onDestroyAgents(agents);
  }
};

World.prototype._onCreate = function(entity) {
  if (this.options.onCreateEntity) {
    this.options.onCreateEntity(entity);
  }
};

World.prototype._onDestroy = function(entity) {
  if (this.options.onDestroyEntity) {
    this.options.onDestroyEntity(entity);
  }
};

World.prototype._getEntityList = function(entity) {
  if (entity instanceof Context) { // is context
    return this.entities.contexts;
  } else if (entity instanceof Group) { // is group
    return this.entities.groups;
  } else if (entity instanceof Path) { // is path
    return this.entities.paths;
  } else if (entity instanceof Wall) { // is wall
    return this.entities.walls;
  } else {
    throw 'Entity object is not context, group, wall or path';
  }
};

World.prototype.removeEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  var idx = entityList.indexOf(entity);
  if (idx !== -1) {
    entityList.splice(idx, 1);
    this._onDestroy(entity);
    this.changes++;
  }
};

World.prototype.addEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  entityList.push(entity);
  this._onCreate(entity);
  this.changes++;
};

World.prototype.addContext = function(context) {
  this.entities.contexts.push(context);
  this._onCreate(context);
};

World.prototype.addGroup = function(group) {
  this.entities.groups.push(group);
  this._onCreate(group);
};

World.prototype.addPath = function(path) {
  this.entities.paths.push(path);
  this._onCreate(path);
};

World.prototype.addWall = function(wall) {
  this.entities.walls.push(wall);
  this._onCreate(wall);
};

World.prototype.getEntityById = function(id) {
  return Lazy(this.entities).values().flatten().findWhere({id: id});
};

World.prototype.getContextById = function(id) {
  return Lazy(this.entities.contexts).findWhere({id: id});
};

World.prototype.getPathById = function(id) {
  return Lazy(this.entities.paths).findWhere({id: id});
};

World.prototype.getNeighbours = function(agent) {
  return this.grid.neighbours(agent);
};

// TODO add spatial structure to optimize this function
World.prototype.getNearWalls = function(agent) {
  return this.entities.walls;
};

// TODO add spatial structure to optimize this function
World.prototype.agentsInContext = function(context, agents) {
  if (!agents) {
    agents = this.agents;
  }
  //agents = this.grid.in(context);
  var agentsIn = [];
  for (var i in agents) {
    var agent = agents[i];
    if (context.in(agent.pos)) {
      agentsIn.push(agent);
    }
  }
  return agentsIn;
};

World.prototype._saveHelper = function(o) {
  var ignore = ['view', 'extra', 'agents', 'parent', 'world'];
  var cache = [];
  var result = JSON.stringify(o, function(key, value) {
    if (ignore.indexOf(key) !== -1) { return; }
    if (key === 'entities') {
      var entities = {};
      // map entities to array of ids
      for (var prop in value) {
        entities[prop] = value[prop] ? value[prop].id : null;
      }
      return entities;
    }
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Circular reference found, discard key
        throw 'Circular reference found!';
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  }, 2);
  return result;
};

World.prototype.save = function(save) {
  var raw = this._saveHelper(this.entities);
  if (save) {
    this.entitiesSave = raw;
  } else {
    console.log(raw);
    return raw;
  }
};

World.prototype.load = function(loader, loadDefault) {
  if (!loader) {
    // snapshoot load
    if (loadDefault && this.entitiesSave) {
      loader = this.entitiesSave;
    } else {
      return;
    }
  }

  if (typeof(loader) === 'function') {
    // try function loader
    loader(this);
  } else {
    // loader of raw JSON strings
    if (typeof(loader) === 'string') {
      loader = JSON.parse(loader);
    }
    var world = this;
    // check if its json data
    // entites are arred to world passing its reference

    Lazy(loader.walls).each(function(e) {
      var joints = e.children.joints;
      var pos = e.children.joints ? [null, null] : e.pos; // to avoid duplicate init
      var wall = new Wall(pos[0], pos[1], world, e.options, e.id);
      Lazy(joints).each(function(j) {
        wall.addJoint(j.pos[0], j.pos[1], j.options, j.id);
      });
    });
    Lazy(loader.paths).each(function(e) {
      var joints = e.children.joints;
      var pos = e.children.joints ? [null, null] : e.pos; // to avoid duplicates init
      var path = new Path(pos[0], pos[1], world, e.options, e.id);
      Lazy(joints).each(function(j) {
        path.addJoint(j.pos[0], j.pos[1], j.options, j.id);
      });
    });
    Lazy(loader.contexts).each(function(e) {
      new Context(e.pos[0], e.pos[1], world, e.options, e.id);
    });
    Lazy(loader.groups).each(function(e) {
      var g = new Group(e.pos[0], e.pos[1], world, e.options, e.id);
      if (e.entities.startContext) {
        var startContext = world.getContextById(e.entities.startContext);
        g.assignStartContext(startContext);
      }
      if (e.entities.endContext) {
        var endContext = world.getContextById(e.entities.endContext);
        g.assignEndContext(endContext);
      }
      if (e.entities.path) {
        var path = world.getPathById(e.entities.path);
        g.assignPath(path, g.options.pathStart);
      }
      // TODO assign behavior
    });
  }
  this.changes++;
};

World.prototype.step = function(stepSize) {
  this.grid.updateAll(this.agents);

  Lazy(this.agents).each(function(agent) {
    agent.step(stepSize);
  });
  Lazy(this.entities.groups).each(function(group) {
    group.step(stepSize);
  });
  this.changes++;
};

World.prototype.changesNumber = function() {
  var changes = this.changes;
  this.changes = 0;
  return changes;
};
World.prototype.freeze = function(freeze) {
  this.isFrozen = freeze || this.isFrozen;
  return this.isFrozen;
};

World.defaults = {
  near: 2, // grid of 3x3 squares of 2 meters
  width: null,
  height: null,
  onCreateAgents: null,
  onDestroyAgents: null,
  onCreateEntity: null,
  onDestroyEntity: null
};
module.exports = World;
