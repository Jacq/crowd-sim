(function () {
    'use strict';

    var display = {
        running: document.getElementById("runnning"),
        iterations: document.getElementById("iterations")
    };

    var Demo = function () {
        var canvas = document.getElementById("canvas");
        var w = canvas.width = window.innerWidth;
        var h = canvas.height = window.innerHeight;

        // create an new instance of a pixi stage
        var stage = new PIXI.Stage(0x000000);

        // create a renderer instance.
        var renderer = PIXI.autoDetectRenderer(w, h, canvas);


        // add the renderer view element to the DOM
        canvas.appendChild(renderer.view);
        var world = new CrowdSim.World(w, h);
        for (var i = 0; i < 10; i++) {
            var x = Math.random() * w;
            var y = Math.random() * h;

            var single = new CrowdSim.Single(x, y, 5, 0);
            world.add(single);
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
                graphics.lineTo(e.position.x + end_x * e.size * 1.5, e.position.y + end_y * e.size * 1.5);
            };
            this.clear = function () {
                this.graphics.clear();
            };
        };

        for (var j in world.entities) {
            var entity = world.entities[j];
            entity.view = new SingleRender(entity, stage);
        }

        function fullscreen() {
            var el = document.getElementById('canvas');

            if (el.webkitRequestFullScreen) {
                el.webkitRequestFullScreen();
            } else {
                el.mozRequestFullScreen();
            }
        }

        this._renderer = renderer;
        this._stage = stage;
        this.world = world;

        function updateDisplay(engine) {
            display.running.innerHTML = engine.running;
            display.iterations.innerHTML = engine.iterations;
        }
        var options = {
            onStep: updateDisplay
        };

        CrowdSim.Engine.init(this.world, options);
        updateDisplay(CrowdSim.Engine);
        window.requestAnimFrame(this._animate.bind(this));
        // canvas.addEventListener("click", fullscreen);
    };

    Demo.prototype.constructor = Demo;


    Demo.prototype._animate = function () {
        this._renderer.render(this._stage);
        for (var i in this.world.entities) {
            var entity = this.world.entities[i];
            entity.view.render();
        }

        if (this.running) {
            window.requestAnimFrame(this._animate.bind(this));
        }
        // single.render.;
        // render the stage   
    };



    Demo.prototype.Start = function () {
        CrowdSim.Engine.run();
        window.requestAnimFrame(this._animate.bind(this));
        console.log('running');
        this.running = true;
    };

    Demo.prototype.Stop = function () {
        CrowdSim.Engine.stop();
        console.log('stopped');
        this.running = false;
    };
    Demo.prototype.Step = function () {
        CrowdSim.Engine.step();
        window.requestAnimFrame(this._animate.bind(this));
    };

    Demo.prototype.Reset = function () {
        CrowdSim.Engine.reset();
        console.log('reset');
        this.running = false;
    };


    var demo = new Demo();
    window.Demo = demo;
})();