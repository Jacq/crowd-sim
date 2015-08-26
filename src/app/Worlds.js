'use strict';
var CrowdSim = require('CrowdSim');

var Worlds = {
    testFun: function(world, debug) {
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
    testJson: {
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
    },
    simple: {
  "contexts": [],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 100,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 4,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 78.9000015258789,
        "1": 41.70000076293945
      },
      "entities": {
        "path": null,
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [],
  "walls": []
}, contextIn: {
  "contexts": [
    {
      "options": {
        "width": 39,
        "height": 17.000001525878908
      },
      "id": "C0",
      "pos": {
        "0": 75.5999984741211,
        "1": 23.100000381469727
      },
      "entities": {},
      "children": {}
    }
  ],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.2,
        "startRate": 5,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 75.5999984741211,
        "1": 61.599998474121094
      },
      "entities": {
        "path": null,
        "startContext": "C0",
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [],
  "walls": []
}, contextOut: {
  "contexts": [
    {
      "options": {
        "width": 11.999996948242199,
        "height": 44.599999999999994
      },
      "id": "C0",
      "pos": {
        "0": 82,
        "1": 48.29999923706055
      },
      "entities": {},
      "children": {}
    }
  ],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0.2,
        "endRate": 5
      },
      "id": "G0",
      "pos": {
        "0": 41.099998474121094,
        "1": 48.400001525878906
      },
      "entities": {
        "path": null,
        "startContext": null,
        "endContext": "C0"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [],
  "walls": []
}, contextInOut: {
  "contexts": [
    {
      "options": {
        "width": 18.60000305175781,
        "height": 61.39999847412109
      },
      "id": "C0",
      "pos": {
        "0": 44.29999923706055,
        "1": 45.70000076293945
      },
      "entities": {},
      "children": {}
    },
    {
      "options": {
        "width": 15.199996948242188,
        "height": 72.4000015258789
      },
      "id": "C4",
      "pos": {
        "0": 108.69999694824219,
        "1": 49
      },
      "entities": {},
      "children": {}
    }
  ],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 1000,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.5,
        "startRate": 10,
        "endProb": 0.5,
        "endRate": 5
      },
      "id": "G2",
      "pos": {
        "0": 81.30000305175781,
        "1": 83
      },
      "entities": {
        "path": null,
        "startContext": "C0",
        "endContext": "C4"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [],
  "walls": []
},
path:{
  "contexts": [],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.2,
        "startRate": 5,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 36.599998474121094,
        "1": 44.400001525878906
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 46.79999923706055,
        "1": 54
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 43.400001525878906,
              "1": 30.5
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 64,
              "1": 15.800000190734863
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 108.9000015258789,
              "1": 18.299999237060547
            },
            "entities": {},
            "children": {},
            "id": "J2"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 120,
              "1": 35.099998474121094
            },
            "entities": {},
            "children": {},
            "id": "J3"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 115.30000305175781,
              "1": 53.79999923706055
            },
            "entities": {},
            "children": {},
            "id": "J4"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 97.69999694824219,
              "1": 77
            },
            "entities": {},
            "children": {},
            "id": "J5"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 62,
              "1": 71.5999984741211
            },
            "entities": {},
            "children": {},
            "id": "J6"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 46.79999923706055,
              "1": 54
            },
            "entities": {},
            "children": {},
            "id": "J7"
          }
        ]
      }
    }
  ],
  "walls": []
},
pathLoop: {
  "contexts": [],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 6,
        "pathReverse": true,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 43.099998474121094,
        "1": 28.799999237060547
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    },
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G1",
      "pos": {
        "0": 103.30000305175781,
        "1": 28.200000762939453
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 62.5,
        "1": 43.70000076293945
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 91,
              "1": 43.5
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 115.30000305175781,
              "1": 48.400001525878906
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 107,
              "1": 74.9000015258789
            },
            "entities": {},
            "children": {},
            "id": "J2"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 68,
              "1": 77.9000015258789
            },
            "entities": {},
            "children": {},
            "id": "J3"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 41.900001525878906,
              "1": 72.4000015258789
            },
            "entities": {},
            "children": {},
            "id": "J4"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 44.5,
              "1": 45.400001525878906
            },
            "entities": {},
            "children": {},
            "id": "J5"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 62.5,
              "1": 43.70000076293945
            },
            "entities": {},
            "children": {},
            "id": "J6"
          }
        ]
      }
    }
  ],
  "walls": []
}, pathGroup: {
  "contexts": [],
  "groups": [
    {
      "options": {
        "agentsAspect": 32255,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 50,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 1,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 67,
        "1": 28.200000762939453
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    },
    {
      "options": {
        "agentsAspect": 261637,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 50,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 2,
        "pathReverse": true,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G1",
      "pos": {
        "0": 96.4000015258789,
        "1": 72.9000015258789
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 126.0999984741211,
        "1": 47.5
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 36.599998474121094,
              "1": 46.29999923706055
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 67.30000305175781,
              "1": 46.900001525878906
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 95.69999694824219,
              "1": 47.5
            },
            "entities": {},
            "children": {},
            "id": "J2"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 126.0999984741211,
              "1": 47.5
            },
            "entities": {},
            "children": {},
            "id": "J3"
          }
        ]
      }
    }
  ],
  "walls": []
},
wall: {
  "contexts": [],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 68.80000305175781,
        "1": 65.5
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 48,
        "1": 40.900001525878906
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 90.0999984741211,
              "1": 40.79999923706055
            },
            "entities": {},
            "children": {},
            "id": "J2"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 48,
              "1": 40.900001525878906
            },
            "entities": {},
            "children": {},
            "id": "J3"
          }
        ]
      }
    }
  ],
  "walls": [
    {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W0",
      "pos": {
        "0": 67.30000305175781,
        "1": 53.20000076293945
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 67.4000015258789,
              "1": 32
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 67.30000305175781,
              "1": 53.20000076293945
            },
            "entities": {},
            "children": {},
            "id": "J1"
          }
        ]
      }
    }
  ]
},pathSize:{
  "contexts": [],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 500,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 35.425113677978516,
        "1": 50.41111373901367
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 126.98758697509766,
        "1": 51.00733184814453
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 2,
              "scalable": true
            },
            "pos": {
              "0": 47.26435470581055,
              "1": 50.581459045410156
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 8,
              "scalable": true
            },
            "pos": {
              "0": 68.132080078125,
              "1": 39.423614501953125
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 2,
              "scalable": true
            },
            "pos": {
              "0": 88.7442855834961,
              "1": 63.01692199707031
            },
            "entities": {},
            "children": {},
            "id": "J2"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 7,
              "scalable": true
            },
            "pos": {
              "0": 106.54573059082031,
              "1": 36.357337951660156
            },
            "entities": {},
            "children": {},
            "id": "J3"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 2,
              "scalable": true
            },
            "pos": {
              "0": 129.20211791992188,
              "1": 50.581459045410156
            },
            "entities": {},
            "children": {},
            "id": "J4"
          }
        ]
      }
    }
  ],
  "walls": []
},paths:{
  "contexts": [],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 81.80000305175781,
        "1": 44
      },
      "entities": {
        "path": "P6",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    },
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G1",
      "pos": {
        "0": 52.599998474121094,
        "1": 22.700000762939453
      },
      "entities": {
        "path": "P5",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    },
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": true,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G2",
      "pos": {
        "0": 17.799999237060547,
        "1": 22.700000762939453
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 26.899999618530273,
        "1": 59.5
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 26,
              "1": 43.900001525878906
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 27.600000381469727,
              "1": 22.5
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 42.400001525878906,
              "1": 12.600000381469727
            },
            "entities": {},
            "children": {},
            "id": "J2"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 73,
              "1": 12.300000190734863
            },
            "entities": {},
            "children": {},
            "id": "J3"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 99.4000015258789,
              "1": 13.199999809265137
            },
            "entities": {},
            "children": {},
            "id": "J4"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 120,
              "1": 12.100000381469727
            },
            "entities": {},
            "children": {},
            "id": "J5"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 133.10000610351562,
              "1": 16.299999237060547
            },
            "entities": {},
            "children": {},
            "id": "J6"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 139.6999969482422,
              "1": 36.900001525878906
            },
            "entities": {},
            "children": {},
            "id": "J7"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 139.10000610351562,
              "1": 62.79999923706055
            },
            "entities": {},
            "children": {},
            "id": "J8"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 134.10000610351562,
              "1": 81.9000015258789
            },
            "entities": {},
            "children": {},
            "id": "J9"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 104.30000305175781,
              "1": 88.5999984741211
            },
            "entities": {},
            "children": {},
            "id": "J10"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 63.5,
              "1": 87.5
            },
            "entities": {},
            "children": {},
            "id": "J11"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 45.099998474121094,
              "1": 84.69999694824219
            },
            "entities": {},
            "children": {},
            "id": "J12"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 26.899999618530273,
              "1": 70.80000305175781
            },
            "entities": {},
            "children": {},
            "id": "J13"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 26.899999618530273,
              "1": 59.5
            },
            "entities": {},
            "children": {},
            "id": "J14"
          }
        ]
      }
    },
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P5",
      "pos": {
        "0": 47.5,
        "1": 56.900001525878906
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 48.79999923706055,
              "1": 41
            },
            "entities": {},
            "children": {},
            "id": "J39"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 77.5999984741211,
              "1": 32.900001525878906
            },
            "entities": {},
            "children": {},
            "id": "J40"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 96.30000305175781,
              "1": 32.900001525878906
            },
            "entities": {},
            "children": {},
            "id": "J41"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 122.80000305175781,
              "1": 47.29999923706055
            },
            "entities": {},
            "children": {},
            "id": "J42"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 122.4000015258789,
              "1": 65
            },
            "entities": {},
            "children": {},
            "id": "J43"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 97.30000305175781,
              "1": 72
            },
            "entities": {},
            "children": {},
            "id": "J44"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 62.900001525878906,
              "1": 71.5999984741211
            },
            "entities": {},
            "children": {},
            "id": "J45"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 47.5,
              "1": 56.900001525878906
            },
            "entities": {},
            "children": {},
            "id": "J46"
          }
        ]
      }
    },
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P6",
      "pos": {
        "0": 101.30000305175781,
        "1": 51
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 67.5999984741211,
              "1": 51.70000076293945
            },
            "entities": {},
            "children": {},
            "id": "J47"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 101.30000305175781,
              "1": 51
            },
            "entities": {},
            "children": {},
            "id": "J48"
          }
        ]
      }
    }
  ],
  "walls": []
}, contextRate: {
  "contexts": [
    {
      "options": {
        "width": 9.799996948242182,
        "height": 10.599999999999994
      },
      "id": "C0",
      "pos": {
        "0": 41.400001525878906,
        "1": 31.700000762939453
      },
      "entities": {},
      "children": {}
    },
    {
      "options": {
        "width": 16.9999969482422,
        "height": 19.00000076293945
      },
      "id": "C1",
      "pos": {
        "0": 95.4000015258789,
        "1": 31
      },
      "entities": {},
      "children": {}
    },
    {
      "options": {
        "width": 16.200001525878903,
        "height": 14.800001525878912
      },
      "id": "C2",
      "pos": {
        "0": 42.5,
        "1": 59
      },
      "entities": {},
      "children": {}
    },
    {
      "options": {
        "width": 13.600003051757824,
        "height": 13.799996948242182
      },
      "id": "C3",
      "pos": {
        "0": 94.30000305175781,
        "1": 57.900001525878906
      },
      "entities": {},
      "children": {}
    }
  ],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 200,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.5,
        "startRate": 1,
        "endProb": 0.1,
        "endRate": 2
      },
      "id": "G0",
      "pos": {
        "0": 62.79999923706055,
        "1": 17.5
      },
      "entities": {
        "path": null,
        "startContext": "C0",
        "endContext": "C1"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    },
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 2,
        "startProb": 0.1,
        "startRate": 1,
        "endProb": 0.15,
        "endRate": 1
      },
      "id": "G1",
      "pos": {
        "0": 68,
        "1": 72.9000015258789
      },
      "entities": {
        "path": null,
        "startContext": "C3",
        "endContext": "C2"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [],
  "walls": []
},pathContexts:{
  "contexts": [
    {
      "options": {
        "width": 10.800003051757812,
        "height": 28.400001525878906
      },
      "id": "C0",
      "pos": {
        "0": 34.400001525878906,
        "1": 45
      },
      "entities": {},
      "children": {}
    },
    {
      "options": {
        "width": 9.600000000000023,
        "height": 31.400001525878906
      },
      "id": "C1",
      "pos": {
        "0": 130.8000030517578,
        "1": 45.20000076293945
      },
      "entities": {},
      "children": {}
    }
  ],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 1000,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.1,
        "startRate": 10,
        "endProb": 0.2,
        "endRate": 5
      },
      "id": "G0",
      "pos": {
        "0": 83.80000305175781,
        "1": 72
      },
      "entities": {
        "path": "P1",
        "startContext": "C0",
        "endContext": "C1"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 117.5,
        "1": 45.400001525878906
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 48.79999923706055,
              "1": 45.5
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 82.4000015258789,
              "1": 45.70000076293945
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 117.5,
              "1": 45.400001525878906
            },
            "entities": {},
            "children": {},
            "id": "J2"
          }
        ]
      }
    }
  ],
  "walls": []
},
pathCtxGro:{
  "contexts": [
    {
      "options": {
        "width": 14.399999237060541,
        "height": 37.400000000000006
      },
      "id": "C0",
      "pos": {
        "0": 30,
        "1": 43.20000076293945
      },
      "entities": {},
      "children": {}
    },
    {
      "options": {
        "width": 8.600003051757824,
        "height": 53.79999923706055
      },
      "id": "C1",
      "pos": {
        "0": 127.5999984741211,
        "1": 48.29999923706055
      },
      "entities": {},
      "children": {}
    }
  ],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 6,
        "startProb": 0.05,
        "startRate": 2,
        "endProb": 0.1,
        "endRate": 2
      },
      "id": "G0",
      "pos": {
        "0": 80.0999984741211,
        "1": 19.899999618530273
      },
      "entities": {
        "path": "P1",
        "startContext": "C0",
        "endContext": "C1"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    },
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 3,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 6,
        "startProb": 0.05,
        "startRate": 2,
        "endProb": 0.1,
        "endRate": 2
      },
      "id": "G1",
      "pos": {
        "0": 80.5,
        "1": 68.5
      },
      "entities": {
        "path": "P1",
        "startContext": "C1",
        "endContext": "C0"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 115.80000305175781,
        "1": 46.599998474121094
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 46.099998474121094,
              "1": 46.70000076293945
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 8,
              "scalable": true
            },
            "pos": {
              "0": 67.9000015258789,
              "1": 46.5
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 8,
              "scalable": true
            },
            "pos": {
              "0": 95.0999984741211,
              "1": 46.29999923706055
            },
            "entities": {},
            "children": {},
            "id": "J2"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 115.80000305175781,
              "1": 46.599998474121094
            },
            "entities": {},
            "children": {},
            "id": "J3"
          }
        ]
      }
    }
  ],
  "walls": []
},
wallsPathGr: {
  "contexts": [],
  "groups": [
    {
      "options": {
        "agentsAspect": 0,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 200,
        "agentsMax": 200,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 12,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G0",
      "pos": {
        "0": 47.6134147644043,
        "1": 47.2495002746582
      },
      "entities": {
        "path": "P1",
        "startContext": null,
        "endContext": null
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 200
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 86.5999984741211,
        "1": 45.400001525878906
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": true
            },
            "pos": {
              "0": 86.5999984741211,
              "1": 45.400001525878906
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 10,
              "scalable": true
            },
            "pos": {
              "0": 116.0999984741211,
              "1": 45.29999923706055
            },
            "entities": {},
            "children": {},
            "id": "J2"
          }
        ]
      }
    }
  ],
  "walls": [
    {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W0",
      "pos": {
        "0": 118.80000305175781,
        "1": 22.700000762939453
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 53.099998474121094,
              "1": 22.399999618530273
            },
            "entities": {},
            "children": {},
            "id": "J3"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 80.21202087402344,
              "1": 42.68868637084961
            },
            "entities": {},
            "children": {},
            "id": "J5"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 92.69818115234375,
              "1": 43.51112747192383
            },
            "entities": {},
            "children": {},
            "id": "J6"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 118.80000305175781,
              "1": 22.700000762939453
            },
            "entities": {},
            "children": {},
            "id": "J8"
          }
        ]
      }
    },
    {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W1",
      "pos": {
        "0": 115.30000305175781,
        "1": 70.69999694824219
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 52.599998474121094,
              "1": 70.9000015258789
            },
            "entities": {},
            "children": {},
            "id": "J9"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 80.36155700683594,
              "1": 48.14670944213867
            },
            "entities": {},
            "children": {},
            "id": "J11"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 93.072021484375,
              "1": 46.72612762451172
            },
            "entities": {},
            "children": {},
            "id": "J12"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 115.30000305175781,
              "1": 70.69999694824219
            },
            "entities": {},
            "children": {},
            "id": "J13"
          }
        ]
      }
    }
  ]
},rooms:{
  "contexts": [
    {
      "options": {
        "width": 17.263547386260512,
        "height": 10.835629013243675
      },
      "id": "C0",
      "pos": {
        "0": 58,
        "1": 13
      },
      "entities": {},
      "children": {}
    },
    {
      "options": {
        "width": 12.00000076293945,
        "height": 21.599999999999994
      },
      "id": "C1",
      "pos": {
        "0": 20.299999237060547,
        "1": 45.5
      },
      "entities": {},
      "children": {}
    },
    {
      "options": {
        "width": 14.399996948242176,
        "height": 13.20000610351562
      },
      "id": "C2",
      "pos": {
        "0": 114,
        "1": 74
      },
      "entities": {},
      "children": {}
    }
  ],
  "groups": [
    {
      "options": {
        "agentsAspect": 16711680,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.01,
        "startRate": 5,
        "endProb": 0.8,
        "endRate": 1
      },
      "id": "G0",
      "pos": {
        "0": 81,
        "1": 9
      },
      "entities": {
        "path": "P2",
        "startContext": "C0",
        "endContext": "C2"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    },
    {
      "options": {
        "agentsAspect": 65280,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 2,
        "pathReverse": true,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.05,
        "startRate": 2,
        "endProb": 0.1,
        "endRate": 3
      },
      "id": "G1111",
      "pos": {
        "0": 110,
        "1": 16
      },
      "entities": {
        "path": "P2",
        "startContext": "C2",
        "endContext": "C0"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    },
    {
      "options": {
        "agentsAspect": 11184810,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 0,
        "pathReverse": false,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0,
        "startRate": 0,
        "endProb": 0,
        "endRate": 0
      },
      "id": "G11111",
      "pos": {
        "0": 38.79999923706055,
        "1": 79.19999694824219
      },
      "entities": {
        "path": "P1",
        "startContext": "C1",
        "endContext": "C2"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    },
    {
      "options": {
        "agentsAspect": 255,
        "agentsSizeMin": 0.5,
        "agentsSizeMax": 0.5,
        "agentsCount": 10,
        "agentsMax": 100,
        "debug": false,
        "pathStart": 3,
        "pathReverse": true,
        "pathCircular": false,
        "radius": 3,
        "startProb": 0.5,
        "startRate": 1,
        "endProb": 0.5,
        "endRate": 2
      },
      "id": "G111111",
      "pos": {
        "0": 73,
        "1": 82.80000305175781
      },
      "entities": {
        "path": "P1",
        "startContext": "C2",
        "endContext": "C1"
      },
      "children": {},
      "behavior": {
        "options": {
          "A": 2000,
          "B": 0.08,
          "kn": 120000,
          "Kv": 240000,
          "relaxationTime": 0.3
        }
      },
      "agentsCount": 10
    }
  ],
  "paths": [
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P1",
      "pos": {
        "0": 102,
        "1": 60
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 3,
              "scalable": true
            },
            "pos": {
              "0": 29.700000762939453,
              "1": 45.599998474121094
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 3,
              "scalable": true
            },
            "pos": {
              "0": 51.79999923706055,
              "1": 47
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 3,
              "scalable": true
            },
            "pos": {
              "0": 84.5,
              "1": 47.70000076293945
            },
            "entities": {},
            "children": {},
            "id": "J2"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 100.0999984741211,
              "1": 59.5
            },
            "entities": {},
            "children": {},
            "id": "J3"
          }
        ]
      }
    },
    {
      "options": {
        "width": 0.2,
        "radius": 4
      },
      "id": "P2",
      "pos": {
        "0": 111,
        "1": 57
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 58,
              "1": 24
            },
            "entities": {},
            "children": {},
            "id": "J4"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 3,
              "scalable": true
            },
            "pos": {
              "0": 69.5,
              "1": 43.900001525878906
            },
            "entities": {},
            "children": {},
            "id": "J5"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 4,
              "scalable": true
            },
            "pos": {
              "0": 111,
              "1": 57
            },
            "entities": {},
            "children": {},
            "id": "J6"
          }
        ]
      }
    }
  ],
  "walls": [
    {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W0",
      "pos": {
        "0": 31,
        "1": 41
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 29.600000381469727,
              "1": 20
            },
            "entities": {},
            "children": {},
            "id": "J0"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 48,
              "1": 20
            },
            "entities": {},
            "children": {},
            "id": "J1"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 48,
              "1": 35
            },
            "entities": {},
            "children": {},
            "id": "J2"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 31,
              "1": 35
            },
            "entities": {},
            "children": {},
            "id": "J3"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 31,
              "1": 41
            },
            "entities": {},
            "children": {},
            "id": "J4"
          }
        ]
      }
    },
    {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W1",
      "pos": {
        "0": 99,
        "1": 67
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 32,
              "1": 53
            },
            "entities": {},
            "children": {},
            "id": "J5"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 60,
              "1": 53
            },
            "entities": {},
            "children": {},
            "id": "J6"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 77,
              "1": 54
            },
            "entities": {},
            "children": {},
            "id": "J7"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 81,
              "1": 67
            },
            "entities": {},
            "children": {},
            "id": "J8"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 99,
              "1": 67
            },
            "entities": {},
            "children": {},
            "id": "J9"
          }
        ]
      }
    },
    {
      "options": {
        "width": 0.2,
        "radius": 1,
        "scalable": false
      },
      "id": "W2",
      "pos": {
        "0": 124,
        "1": 66
      },
      "entities": {},
      "children": {
        "joints": [
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 70,
              "1": 22
            },
            "entities": {},
            "children": {},
            "id": "J10"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 70,
              "1": 37
            },
            "entities": {},
            "children": {},
            "id": "J11"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 97,
              "1": 37
            },
            "entities": {},
            "children": {},
            "id": "J12"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 123.5999984741211,
              "1": 37.900001525878906
            },
            "entities": {},
            "children": {},
            "id": "J13"
          },
          {
            "options": {
              "width": 0.2,
              "radius": 1,
              "scalable": false
            },
            "pos": {
              "0": 124,
              "1": 66
            },
            "entities": {},
            "children": {},
            "id": "J14"
          }
        ]
      }
    }
  ]
}


  };

module.exports = Worlds;
