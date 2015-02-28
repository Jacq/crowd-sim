

describe('Core tests', function() {
  'use strict';
  //debugger;
  it('Exist namespace', function() {
    expect(CrowdSim).not.toBeNull();
    expect(CrowdSim.World).toBeDefined();
    expect(CrowdSim.Engine).toBeDefined();
  });

  it('Engine', function() {
    expect(CrowdSim.Engine).not.toBeNull();
    w = new CrowdSim.World(100, 100);
    e = new CrowdSim.Engine(w);
    expect(e).not.toBeNull();
    expect(e.running).toBe(false);
    e.run();
    expect(e.running).toBe(true);
    e.stop();
    expect(e.running).toBe(false);
    e.reset();
    expect(e.running).toBe(false);
  });

});
