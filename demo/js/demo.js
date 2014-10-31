(function () {
    'use strict';
    var canvas = document.getElementById("canvas");
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;

    // create an new instance of a pixi stage
    var stage = new PIXI.Stage(0x000000);

    // create a renderer instance.
    var renderer = PIXI.autoDetectRenderer(w, h, canvas);


    // add the renderer view element to the DOM
    canvas.appendChild(renderer.view);

    for (var i = 0; i < 10; i++) {
        var x = Math.random() * w;
        var y = Math.random() * h;

        var single = new CrowdSim.Single(x, y, 5, 0);
        CrowdSim.World.add(single);
    }

    var SingleRender = function (single, stage) {
        this.single = single;
        var graphics = new PIXI.Graphics();
        // add it the stage so we see it on our screens..
        this.graphics = graphics;
        stage.addChild(graphics);

        this.render = function () {
            this.clear();
            var e = this.single;
            // begin a green fill..
            graphics.lineStyle(1, 0xFF0000);
            // draw a triangle using lines
            graphics.drawCircle(e.position.x, e.position.y, e.size);
            graphics.moveTo(e.position.x, e.position.y);
            var end_x = Math.cos(e.direction);
            var end_y = Math.sin(e.direction);
            graphics.lineTo(e.position.x + end_x * e.size, e.position.y + end_y * e.size);
        };
        this.clear = function () {
            this.graphics.clear();
        };
    };

    for (var i in CrowdSim.World.entities) {
        var entity = CrowdSim.World.entities[i];
        entity.view = new SingleRender(entity, stage);
    }

    requestAnimFrame(animate);


    function animate() {
        renderer.render(stage);
        for (var i in CrowdSim.World.entities) {
            var entity = CrowdSim.World.entities[i];
            entity.view.render();
        }

        requestAnimFrame(animate);
        // single.render.;
        // render the stage   
    }

    var move = function () {

        for (var i in CrowdSim.World.entities) {
            var entity = CrowdSim.World.entities[i];
            entity.position.x += Math.random() * 2 - 1;
            entity.position.y += Math.random() * 2 - 1;
        }

        //  console.log(single);
        setTimeout(move, 10);
    };
    move();

    function fullscreen() {
        var el = document.getElementById('canvas');

        if (el.webkitRequestFullScreen) {
            el.webkitRequestFullScreen();
        } else {
            el.mozRequestFullScreen();
        }
    }

    canvas.addEventListener("click", fullscreen);




})();