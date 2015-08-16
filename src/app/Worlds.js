'use strict';
var CrowdSim = require('CrowdSim');

var Worlds = {
    world1: function(world, debug) {
      // wire world events and adding entities functions
      var sizeR = 20;
      var sizeC = 10;
      var door = sizeR / 8;
      var cx = 55,
        cy = 45;
      var gx = 65,
        gy = 50;
      var radius = 4;
      var waypoints = [
        [10, 10],
        [20, 21],
        [31, 30],
        [41, 41],
        [41, 75],
        [55, 80],
        [65, 70],
        [65, 60]
      ];
      var path = new CrowdSim.Path(null, null, world);
      path.addJoints(waypoints);
      path.reverse();

      //var path = new CrowdSim.Path([{pos: [65, 60], radius: radius / 2}, {pos: [65, 70], radius: radius / 2}, {pos: [55, 80], radius: 2 * radius}]);

      var startContext = new CrowdSim.Context(gx, gy, world, {
        width: sizeC,
        height: sizeC
      });
      //var endContext = new CrowdSim.Context(55  , 80 - sizeC , sizeC, sizeC);
      var endContext = new CrowdSim.Context(10, 10, world, {
        width: sizeC,
        height: sizeC
      });
      var opts = {
        debug: debug,
        agentsCount: 10,
        agentsMax: 1000,
        agentsSizeMin: 0.5,
        agentsSizeMax: 0.6,
        startProb: 0.1,
        startRate: 1,
        endProb: 0.1,
        endRate: 1
      };
      var group = new CrowdSim.Group(60, 30, world, opts);
      group.assignStartContext(startContext);
      group.assignEndContext(endContext);
      group.assignPath(path);
      var room1 = [
        [cx + sizeR / 2 - door, cy + sizeR],
        [cx, cy + sizeR],
        [cx, cy],
        [cx + sizeR, cy],
        [cx + sizeR, cy + sizeR],
        [cx + sizeR / 2 + door, cy + sizeR]
      ];
      var room = [
        [cx + sizeR / 2 - door, cy + sizeR],
        [cx, cy + sizeR]
      ];
      //var wall = new CrowdSim.Wall(room);
      var wall = new CrowdSim.Wall(null, null, world);
      wall.addJoints(room1);
    },
    world2: {
      'contexts': [{
        'options': {
          'width': 10,
          'height': 10
        },
        'pos': {
          '0': 65,
          '1': 50
        },
        'entities': {},
        'children': {},
        'id': 'C0'
      }, {
        'options': {
          'width': 10,
          'height': 10
        },
        'pos': {
          '0': 10,
          '1': 10
        },
        'entities': {},
        'children': {},
        'id': 'C1'
      }],
      'groups': [{
        'options': {
          'debug': false,
          'agentsCount': 10,
          'agentsMax': 1000,
          'agentsSizeMin': 0.5,
          'agentsSizeMax': 0.6,
          'startProb': 0.1,
          'startRate': 1,
          'endProb': 0.1,
          'endRate': 1,
          'pathStart': 0,
          'pathReverse': false,
          'pathCircular': false,
          'radius': 3
        },
        'pos': {
          '0': 60,
          '1': 30
        },
        'entities': {
          'path': 'P0',
          'startContext': 'C0',
          'endContext': 'C1'
        },
        'children': {},
        'id': 'G0',
        'behavior': {
          'world': {
            'options': {
              'width': 64,
              'height': 64
            },
            'entities': {}
          },
          'options': {
            'A': 2000,
            'B': 0.08,
            'kn': 120000,
            'Kv': 240000,
            'relaxationTime': 0.3
          }
        },
        'agentsCount': 10
      }],
      'paths': [{
        'options': {
          'width': 0.2,
          'radius': 4
        },
        'pos': {
          '0': 65,
          '1': 60
        },
        'entities': {},
        'children': {
          'joints': [{
            'options': {
              'width': 0.2,
              'radius': 4,
              'scalable': true
            },
            'pos': {
              '0': 65,
              '1': 60
            },
            'entities': {},
            'children': {},
            'id': 'J7'
          }, {
            'options': {
              'width': 0.2,
              'radius': 4,
              'scalable': true
            },
            'pos': {
              '0': 65,
              '1': 70
            },
            'entities': {},
            'children': {},
            'id': 'J6'
          }, {
            'options': {
              'width': 0.2,
              'radius': 4,
              'scalable': true
            },
            'pos': {
              '0': 55,
              '1': 80
            },
            'entities': {},
            'children': {},
            'id': 'J5'
          }, {
            'options': {
              'width': 0.2,
              'radius': 4,
              'scalable': true
            },
            'pos': {
              '0': 41,
              '1': 75
            },
            'entities': {},
            'children': {},
            'id': 'J4'
          }, {
            'options': {
              'width': 0.2,
              'radius': 4,
              'scalable': true
            },
            'pos': {
              '0': 41,
              '1': 41
            },
            'entities': {},
            'children': {},
            'id': 'J3'
          }, {
            'options': {
              'width': 0.2,
              'radius': 4,
              'scalable': true
            },
            'pos': {
              '0': 31,
              '1': 30
            },
            'entities': {},
            'children': {},
            'id': 'J2'
          }, {
            'options': {
              'width': 0.2,
              'radius': 4,
              'scalable': true
            },
            'pos': {
              '0': 20,
              '1': 21
            },
            'entities': {},
            'children': {},
            'id': 'J1'
          }, {
            'options': {
              'width': 0.2,
              'radius': 4,
              'scalable': true
            },
            'pos': {
              '0': 10,
              '1': 10
            },
            'entities': {},
            'children': {},
            'id': 'J0'
          }]
        },
        'id': 'P0'
      }],
      'walls': [{
        'options': {
          'width': 0.2,
          'radius': 1,
          'scalable': false
        },
        'pos': {
          '0': 67.5,
          '1': 65
        },
        'entities': {},
        'children': {
          'joints': [{
            'options': {
              'width': 0.2,
              'radius': 1,
              'scalable': false
            },
            'pos': {
              '0': 62.5,
              '1': 65
            },
            'entities': {},
            'children': {},
            'id': 'J8'
          }, {
            'options': {
              'width': 0.2,
              'radius': 1,
              'scalable': false
            },
            'pos': {
              '0': 55,
              '1': 65
            },
            'entities': {},
            'children': {},
            'id': 'J9'
          }, {
            'options': {
              'width': 0.2,
              'radius': 1,
              'scalable': false
            },
            'pos': {
              '0': 55,
              '1': 45
            },
            'entities': {},
            'children': {},
            'id': 'J10'
          }, {
            'options': {
              'width': 0.2,
              'radius': 1,
              'scalable': false
            },
            'pos': {
              '0': 75,
              '1': 45
            },
            'entities': {},
            'children': {},
            'id': 'J11'
          }, {
            'options': {
              'width': 0.2,
              'radius': 1,
              'scalable': false
            },
            'pos': {
              '0': 75,
              '1': 65
            },
            'entities': {},
            'children': {},
            'id': 'J12'
          }, {
            'options': {
              'width': 0.2,
              'radius': 1,
              'scalable': false
            },
            'pos': {
              '0': 67.5,
              '1': 65
            },
            'entities': {},
            'children': {},
            'id': 'J13'
          }]
        },
        'id': 'W0'
      }]
    }
  };

module.exports = Worlds;
