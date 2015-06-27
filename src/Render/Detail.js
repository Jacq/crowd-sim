'use strict';

var Detail = function(maxDetail, detail) {
  this.maxDetail = maxDetail;
  this.level = detail || 1;
};

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
