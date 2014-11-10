// <reference path = "core.js">
/* global describe,it, expect, CrowdSim */

describe("Core tests", function () {
    "use strict";
    //debugger;
    it("Exist namespace", function () {
        expect(CrowdSim).not.toBeNull();
        expect(CrowdSim.World).toBeDefined();
        expect(CrowdSim.Engine).toBeDefined();
    });

    it("Engine", function () {
        expect(CrowdSim.Engine).not.toBeNull();
        expect(CrowdSim.Engine.running).toBe(false);
        CrowdSim.Engine.run();
        expect(CrowdSim.Engine.running).toBe(true);
        CrowdSim.Engine.stop();
        expect(CrowdSim.Engine.running).toBe(false);
        CrowdSim.Engine.reset();
        expect(CrowdSim.Engine.running).toBe(false);
    });


});