'use strict';

var LinePrototype = require('./Helpers/LinePrototype');
var AssignableToGroup = require('./Helpers/Traits').AssignableToGroup;

/**
 * @module Entities
 * @submodule Path
 */
var Path = LinePrototype('P','path',{
  width: 0.2,
  radius: 4
});

Path.defaults = {
  width: 0.2,
  radius: 4
};
Path.id = 0;
Path = AssignableToGroup(Path);
module.exports = Path;
