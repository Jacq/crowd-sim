'use strict';

/**
 * Detail manager.
 * 
 * @class Detail
 * @constructor
 * @param {Number} maxDetail
 * @param {Number} detail
 */
var Detail = function(maxDetail, detail) {
  this.maxDetail = maxDetail;
  this.level = detail || 1;
};

/**
 * Cycle detail levels.
 *
 * @method cycleDetail
 * @param {Number} detail to set, optional.
 */
Detail.prototype.cycleDetail = function(detail) {
  if (detail) {
    this.level = detail;
  } else {
    this.level ++;
    if (this.level > this.maxDetail) {
      this.level = 0;
    }
  }
};

module.exports = Detail;
