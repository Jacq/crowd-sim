'use strict';

var PathModel = require('CrowdSim').Path;
var Base = require('./Base');
var Entity = require('./Entity');
var Detail = require('./Detail');
var LinePrototype = require('./LinePrototype');
var Colors = Base.Colors;

var Path = LinePrototype(Colors.Path);

Path.CreateFromModel = function(path) {
  return new Path(path);
};

Path.CreateFromPoint = function(x, y, parent, options) {
  var path = new PathModel(x, y, parent, options);
  return new Path(path);
};

Path.prototype.getPos = function() {
  return Entity.prototype.getPos.call(this);
};

Path.texture = null; // paths joint texture
Path.detail = new Detail(2);

module.exports = Path;
