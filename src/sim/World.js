'use strict';

var Context = require('./Entities/Context');
var Group = require('./Entities/Group');
var Path = require('./Entities/Path');
var Wall = require('./Entities/Wall');
var Grid = require('./Common/Grid');

/**
 * The world where al entities live
 *
 * @class World
 * @constructor
 * @param {Object} parent entity
 * @param {Object} options
 */
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
  this.gridWalls = new Grid(this.options.near);
  this.changes = 1;
  this.isFrozen = true;
};

/**
 * Gets and resets the number of steps executed since last call
 *
 * @method changesNumber
 * @return {Number} changes
 */
World.prototype.changesNumber = function() {
  var changes = this.changes;
  this.changes = 0;
  return changes;
};
/**
 * Get/set if the world is not running (Frozen). This is set from the Engine
 *
 * @method freeze
 * @param {Boolean} freeze
 * @return {Boolean} true if world is static
 */
World.prototype.freeze = function(freeze) {
  this.isFrozen = freeze || this.isFrozen;
  return this.isFrozen;
};

/**
 * Returns the first group created.
 *
 * @method getDefaultGroup
 * @return {Object} group
 */
World.prototype.getDefaultGroup = function() {
  return this.entities.groups[0];
};

/**
 * Get the list of Agents.
 *
 * @method getAgents
 * @return {Array} agents
 */
World.prototype.getAgents = function() {
  return this.agents;
};

/**
 * Gets a iterator for all entities.
 *
 * @method getEntitiesIterator
 * @return {Object} Lazy iterator
 */
World.prototype.getEntitiesIterator = function() {
  return Lazy(this.entities).values().flatten();
};

/**
 * Get the list of contexts.
 *
 * @method getContexts
 * @return {Array} contexts
 */
World.prototype.getContexts = function() {
  return this.entities.contexts;
};

/**
 * Get the list of groups.
 *
 * @method getGroups
 * @return {Array} groups
 */
World.prototype.getGroups = function() {
  return this.entities.groups;
};

/**
 * Get the list of paths.
 *
 * @method getPaths
 * @return {Array} paths
 */
World.prototype.getPaths = function() {
  return this.entities.paths;
};

/**
 * Get the list of walls.
 *
 * @method getWalls
 * @return {Array} walls
 */
World.prototype.getWalls = function() {
  return this.entities.walls;
};

/**
 * Add an array of Agents from the world.
 *
 * @method addAgents
 * @param {Array} agents
 */
World.prototype.addAgents = function(agents) {
  this.agents = this.agents.concat(agents);
  this.grid.insert(agents);
  if (this.options.onCreateAgents) {
    this.options.onCreateAgents(agents);
  }
};

/**
 * Remove an array of agents from the World.
 *
 * @method removeAgents
 * @param {Array} agents
 */
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

/**
 * Get the list of agents in a given Context
 *
 * @method agentsInContext
 * @param {Context} context
 * @return {Array} all entities
 */
World.prototype.agentsInContext = function(context) {
  return this.grid.neighboursContext(context).filter(function(agent) {
    return context.in(agent.pos);
  }).toArray();
};

/**
 * Callback trigger when an entity is created
 *
 * @method _onCreate
 * @param  {Entity} entity Context, Group, Wall or Path
 */
World.prototype._onCreate = function(entity) {
  if (this.options.onCreateEntity) {
    this.options.onCreateEntity(entity);
  }
};

/**
 * Callback trigger when an entity is destroyed
 *
 * @method _onDestroy
 * @param  {Entity} entity Context, Group, Wall or Path
 */
World.prototype._onDestroy = function(entity) {
  if (this.options.onDestroyEntity) {
    this.options.onDestroyEntity(entity);
  }
};

/**
 * Returns the property that holds the entity list, used internally.
 *
 * @method _getEntityList
 * @param  {Entity} entity Context, Group, Wall or Path
 */
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

/**
 * Remove an entity from the world. Called by entities on destroy.
 *
 * @method removeEntity
 * @param {Entity} entity Context, Group, Wall or Path
 */
World.prototype.removeEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  var idx = entityList.indexOf(entity);
  if (idx !== -1) {
    entityList.splice(idx, 1);
    this._onDestroy(entity);
    this.changes++;
  }
};

/**
 * Add an entity from the world. Called by entities on constructor.
 *
 * @method addEntity
 * @param {Entity} entity Context, Group, Wall or Path
 */
World.prototype.addEntity = function(entity) {
  var entityList = this._getEntityList(entity);
  entityList.push(entity);
  this._onCreate(entity);
  this.changes++;
};

/**
 * Add a Context to the world.
 *
 * @method addContext
 * @param {Context} context
 */
World.prototype.addContext = function(context) {
  this.entities.contexts.push(context);
  this._onCreate(context);
};

/**
 * Add a Group to the world.
 *
 * @method addGroup
 * @param {Group} group
 */
World.prototype.addGroup = function(group) {
  this.entities.groups.push(group);
  this._onCreate(group);
};

/**
 * Add a Path to the world.
 *
 * @method addPath
 * @param {Path} path
 */
World.prototype.addPath = function(path) {
  this.entities.paths.push(path);
  this._onCreate(path);
};

/**
 * Add a Wall to the world.
 *
 * @method addWall
 * @param {Wall} wall
 */
World.prototype.addWall = function(wall) {
  this.entities.walls.push(wall);
  this._onCreate(wall);
};

/**
 * Search an entity in the world by its id.
 *
 * @method getEntityById
 * @param {String} id
 * @return {Entity}
 */
World.prototype.getEntityById = function(id) {
  return Lazy(this.entities).values().flatten().findWhere({id: id});
};

/**
 * Search an context in the world by its id.
 *
 * @method getContextById
 * @param {String} id
 * @return {Array} contexts
 */
World.prototype.getContextById = function(id) {
  return Lazy(this.entities.contexts).findWhere({id: id});
};

/**
 * Search an path in the world by its id.
 *
 * @method getPathById
 * @param {String} id
 * @return {Array} paths
 */
World.prototype.getPathById = function(id) {
  return Lazy(this.entities.paths).findWhere({id: id});
};

/**
 * Returns the agents near to another.
 * The near property is given in the options constructor parameter
 *
 * @method getNearAgents
 * @param {Agent} agent
 * @return {Array} agents
 */
World.prototype.getNearAgents = function(agent) {
  return this.grid.neighbours(agent).toArray();
};

/**
 * Returns the agents near to another.
 *
 * The near property is given in the options constructor parameter
 *
 * @method getNearWalls
 * @param {Agent} agent
 * @return {Array} walls
 */
World.prototype.getNearWalls = function(agent) {
  return this.gridWalls.neighbours(agent).uniq().toArray();
};

/**
 * Save the world state without agents.
 *
 * @method save
 * @param {Boolean} save true to store internally; false to return the JSON data
 */
World.prototype.save = function(save) {
  var raw = this._saveHelper(this.entities);
  if (save) {
    this.entitiesSave = raw;
  } else {
    console.log(raw);
    return raw;
  }
};

/**
 * Load the world state from a loader.
 *
 * @method load
 * @param {String|Function} loader
 * @param {Boolean} loadDefault true to load the last snapshoot created with save(true)
 */
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
    });
  }
  this.changes++;
};

/**
 * Save helper to remove loops and agents from world data.
 *
 * @method _saveHelper
 * @param  {Object} o the world.entities property
 * @return {String} JSON data that represents the world.entities
 */
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

/**
 * Advances the simulation of the world entities one stepSize.
 * If one contexts configured to nofify when agentsIn === 0
 *
 * @method step
 * @param {Number} stepSize defined by the simulation step size
 * @return {Context|Null} contextEmpty that triggers step
 */
World.prototype.step = function(stepSize) {
  var that = this;
  this.grid.updateAll(this.agents);
  this.gridWalls.updateWallsHelper(this.entities.walls);

  // check contexts interaction reducing speed or life of agents
  Lazy(this.entities.contexts).filter(function(c) {return c.getMobility() !== 1;}).each(function(context) {
    var agents = that.agentsInContext(context, that.agents);
    if (agents.length > 0) {
      Lazy(agents).each(function(agent) {
        agent.setCurrentMobility(context.getMobility());
      });
    }
  });

  Lazy(this.agents).each(function(agent) {
    agent.step(stepSize);
  });

  Lazy(this.entities.groups).each(function(group) {
    group.step(stepSize);
  });

  // check contexts that triggers stop on empty
  var contextEmpty = null;
  Lazy(this.entities.contexts).filter(function(c) {return c.getTrigger();}).each(function(context) {
    var agents = that.agentsInContext(context, that.agents);
    if (agents.length === 0) {
      contextEmpty = context; // to inform engine of stop source
    }
  });
  this.changes++;
  return contextEmpty;
};

World.defaults = {
  near: 8, // grid of 3x3 squares of 3 meters
  width: null,
  height: null,
  onCreateAgents: null,
  onDestroyAgents: null,
  onCreateEntity: null,
  onDestroyEntity: null
};
module.exports = World;
