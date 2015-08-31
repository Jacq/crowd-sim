'use strict';

var Base = require('./Base');
var Joint = require('./Joint');
var Entity = require('./Entity');
var Detail = require('./Detail');
var Colors = Base.Colors;

/**
 * Line rendering for paths and walls prototype.
 *
 * @class Render.Line
 * @constructor
 * @param {Number} color
 * @return {LinePrototype} Line prototype
 */
var LinePrototype = function(color) {

  /**
   * Line rendering for paths and walls.
   *
   * @constructor
   * @method Line
   * @param {Wall|Path} line
   */
  var Line = function(line) {
    if (!line) {
      throw 'Line object must be defined';
    }
    Entity.call(this, line);
  };

  /**
   * Create base graphics.
   *
   * @method createGraphics
   * @param {Wall|Path} line
   */
  Line.prototype.createGraphics = function(line) {
    this.graphics = Entity.prototype.createGraphics.call(this, Line.container);
    this.label = new PIXI.Text(line.id, Base.Fonts.default);
    this.label.resolution = Base.Fonts.resolution;
    this.graphics.addChild(this.label);
    var jts = line.getJoints();
    this.label.x = jts[0].pos[0] - this.label.width / 2;
    this.label.y = jts[0].pos[1] - this.label.height / 2;
    if (jts && jts.length > 0) {
      for (var i in jts) {
        this.addJointFromModel(jts[i]);
      }
    }
  };

  /**
   * Destroy base graphics.
   *
   * @method destroy
   */
  Line.prototype.destroy = function() {
    var that = this;
    that.graphics.removeChild(that.label);
    that.label.destroy();
    Entity.prototype.destroyGraphics.call(that, Line.container, that.graphics);
    Entity.prototype.destroy.call(that);
  };

  /**
   * Add a render joint from a joint entity.
   *
   * @method addJointFromModel
   * @param {Joint} joint
   * @return {Render.Joint} render joint
   */
  Line.prototype.addJointFromModel = function(joint) {
    var renderJoint = new Joint(joint, Line.texture);
    renderJoint.createGraphics(this.graphics);
    return renderJoint;
  };

  /**
   * Create a joint in a position.
   *
   * @method addJoint
   * @param {Number} x
   * @param {Number} y
   * @param {Options} options for creation
   * @return {Render.Joint}
   */
  Line.prototype.addJoint = function(x, y, options) {
    var line = this.entityModel;
    var jt = line.addJoint(x, y, options);
    return this.addJointFromModel(jt);
  };

  /**
   * Animate joint, position and radius.
   *
   * @method render
   * @param {Object} options
   */
  Line.prototype.render = function(options) {
    if (!Line.detail.level) {
      this.graphics.clear();
      return;
    }
    Entity.prototype.render.call(this, this.graphics);
    var line = this.entityModel;
    var jts = line.getJoints();
    if (!line || jts.length === 0) {
      this.destroy();
      for (var i = 0; i < jts.length; i++) {
        jts[i].view.show(false);
      }
    }
    // init render
    if (!this.graphics && Line.detail.level > 0) {
      this.createGraphics(line);
    } else {
      this.graphics.clear();
    }

    if (Line.detail.level > 0) {
      var points  = [];
      this.label.x = jts[0].pos[0] - this.label.width / 3;
      this.label.y = jts[0].pos[1] - this.label.height ;
      this.graphics.lineStyle(line.getWidth(), this.hover ? Colors.Hover : color, 0.6);
      for (var j = 0; j < jts.length; j++) {
        points.push(jts[j].pos[0], jts[j].pos[1]);
        jts[j].view.render();
      }
      this.graphics.drawPolygon(points);
    }
    if (Line.detail.level > 1) {
    }
  };
  return Line;
};

module.exports = LinePrototype;
