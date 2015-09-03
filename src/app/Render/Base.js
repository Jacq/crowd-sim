'use strict';

/**
 * @module Render
 * @submodule Base
 * @class Colors
 */
var Colors = {
  Hover: 0xebff00,
  Context: 0x646729,
  Agent: 0xFF0000,
  Group: 0xAAAAAA,
  Wall: 0x00FF00,
  Joint: 0xAAAAAA,
  Path: 0xe00777,
  Waypoint: 0x7a7a7a,
  Forces: {desired: 0xfffff,
          agents: 0xFF0000,
          walls: 0xc49220
        },
  Helpers: 0xFFFFFF
};

/**
 * @module Render
 * @submodule Base
 * @class Fonts
 */
var Fonts = {
  default: {font: '2px Mono monospace', fill: 0xFFFFFF,
  align: 'center'},
  resolution: 12
};

module.exports.Colors = Colors;
module.exports.Fonts = Fonts;
