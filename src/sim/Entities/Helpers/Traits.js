

var AssignableToGroup = function(EntityPrototype) {

  var oldConstruct = EntityPrototype.prototype;
  var oldDestroy = EntityPrototype.prototype.destroy;

  EntityPrototype = function(x, y, parent, options, id) {
    oldConstruct.constructor.call(this,x, y, parent, options, id);
    this.entities.groups = [];
  };
  EntityPrototype.prototype = oldConstruct;

  EntityPrototype.prototype.destroy = function() {
    // additionally unAssignFromGroup
    for (var g in this.entities.groups) {
      this.entities.groups[g].unAssign(this);
    }
    this.entities.groups.length = 0;
    // call original destroy
    return oldDestroy.call(this);
  };

  EntityPrototype.prototype.assignToGroup = function(entity) {
    var idx = this.entities.groups.indexOf(entity);
    if (idx > -1) {
      throw 'Entity already associated';
    } else {
      this.entities.groups.push(entity);
    }
  };

  EntityPrototype.prototype.unassignFromGroup = function(group) {
    var idx = this.entities.groups.indexOf(group);
    if (idx > -1) {
      this.entities.groups.splice(idx, 1);
    } else {
      throw 'Entity not associated';
    }
  };

  EntityPrototype.prototype.getAssignedGroups = function() {
    return this.entities.groups;
  };

  return EntityPrototype;
};

module.exports.AssignableToGroup = AssignableToGroup;
