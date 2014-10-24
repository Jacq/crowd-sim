// <reference path = "core.js">

"use strict";

describe("Core tests", function () {
    it("Exist namespace", function () {
        expect(CrowdSim).not.toBeNull();
        expect(CrowdSim.World).toBeDefined();
    });

});