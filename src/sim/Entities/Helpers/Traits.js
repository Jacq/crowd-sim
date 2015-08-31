

/**
 * To extend object with assignable to group trait.
 *
 * @class AssignableToGroup
 * @method AssignableToGroup
 * @param {Entity} EntityPrototype
 * @return EntityPrototype
 */
var AssignableToGroup = function(EntityPrototype) {

  var oldConstruct = EntityPrototype.prototype;
  var oldDestroy = EntityPrototype.prototype.destroy;

  /**
   * Create entity at position.
   *
   * @class EntityPrototype
   * @constructor
   * @param {Number} x
   * @param {Number} y
   * @param {Entity} parent
   * @param {Object} options
   * @param {String} id optional to set
   * @return
   */
  EntityPrototype = function(x, y, parent, options, id) {
    oldConstruct.constructor.call(this,x, y, parent, options, id);
    this.entities.groups = [];
  };
  EntityPrototype.prototype = oldConstruct;

  /**
   * Destroy Entity.
   *
   * @method destroy
   * @return {Object} previous destructor
   */
  EntityPrototype.prototype.destroy = function() {
    // additionally unAssignFromGroup
    for (var g in this.entities.groups) {
      this.entities.groups[g].unAssign(this);
    }
    this.entities.groups.length = 0;
    // call original destroy
    return oldDestroy.call(this);
  };

  /**
   * Assing to group.
   *
   * @method assignToGroup
   * @param {Entity} entity
   */
  EntityPrototype.prototype.assignToGroup = function(entity) {
    var idx = this.entities.groups.indexOf(entity);
    if (idx > -1) {
      throw 'Entity already associated';
    } else {
      this.entities.groups.push(entity);
    }
  };

  /**
   * Unassing grom group.
   *
   * @method unassignFromGroup
   * @param {Group} group
   */
  EntityPrototype.prototype.unassignFromGroup = function(group) {
    var idx = this.entities.groups.indexOf(group);
    if (idx > -1) {
      this.entities.groups.splice(idx, 1);
    } else {
      // already removed;
    }
  };

  /**
   * Get assigned groups.
   *
   * @method getAssignedGroups
   * @return {Array} groups
   */
  EntityPrototype.prototype.getAssignedGroups = function() {
    return this.entities.groups;
  };

  return EntityPrototype;
};

module.exports.AssignableToGroup = AssignableToGroup;
