var Engine = {
    running: false,
    iterations: 0,
    STEP: 60,
    world : {}
};

(function () {
    Engine.setWorld = function(world){
        this.world = world;
    };
    
    Engine.getWorld = function(){
        return this.world;
    };
    
    Engine.init = function (world, options) {
        //this.entities_save = JSON.parse(JSON.stringify(world.entities));
        this.world = world;
        this.world.save();
        this.options = options;
        return this.world;
    };
    
    Engine.run = function () {
        if (this.running) return;
        this.running = true;
        this._step();
    };

    Engine.step = function () {
        if (this.running) return;
        this._step();
    };

    Engine._step = function () {
        if (this.world && this.world.entities) {
            for (var i in this.world.entities) {                
                var entity = this.world.entities[i];
                if(entity.selected){
                    this.world.entitiy_selected=entity;
                    continue;
                }
                entity.acceleration.x = (Math.random() - 0.5) / 1000;
                entity.acceleration.y = (Math.random() - 0.5) / 1000;
                entity.velocity.x += entity.acceleration.x * Engine.STEP;
                entity.velocity.y += entity.acceleration.y * Engine.STEP;
                entity.direction = Math.atan2(entity.velocity.y, entity.velocity.x);
                entity.position.x += entity.velocity.x * Engine.STEP;
                entity.position.y += entity.velocity.y * Engine.STEP;

                if (this.world.wrap) {
                    if (entity.position.x > this.world.MAX_X) {
                        entity.position.x = this.world.MIN_X + entity.position.x - this.world.MAX_X;
                    }
                    if (entity.position.x < this.world.MIN_X) {
                        entity.position.x = this.world.MAX_X - (this.world.MIN_X - entity.position.x);
                    }
                    if (entity.position.y > this.world.MAX_Y) {
                        entity.position.y = this.world.MIN_Y + entity.position.y - this.world.MAX_Y;
                    }
                    if (entity.position.y < this.world.MIN_Y) {
                        entity.position.y = this.world.MAX_Y - (this.world.MIN_Y - entity.position.y);
                    }
                }
                if (this.options.onStep) {
                    this.options.onStep(this);
                }
            }
        }
        this.iterations++;
        if (this.running) {
            var that = this;
            setTimeout(function () {
                that._step();
            }, this.STEP);
        }

    };

    Engine.stop = function () {
        if (!this.running) return;
        this.running = false;
    };
    Engine.reset = function () {
        this.iterations = 0;
        this.running = false;
        this.world.restore();
    };

})();