'use strict';
// lol don't judge I wrote this as quickly as I could

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var Ship = function() {};
Ship.prototype = {
    speed: 0,
    acceleration: 0.05,
    position: 43,
    move: function() {
        this.position += this.speed;
    },
    thrust: function() {
        this.speed += this.acceleration;
    },
    update: function() {
        this.move();
    },
    reset: function() {
        this.speed = 0;
        this.position = 0;
    }
};

var Asteroid = function(position, velocity, type) {
    this.type = type || 'asteroid_l';
    this.sprite = undefined;
    this.position = position;
    this.velocity = velocity;
    this.yOffset = 32;
    if(this.type == 'asteroid_l') {
        this.radius = 7;
    }
    else if(this.type == 'asteroid_m') {
        this.radius = 4.5;
    }
    else if(this.type == 'asteroid_s') {
        this.radius = 2.5;
    }
};
Asteroid.prototype = {
    move: function() {
        this.position += this.velocity;
    },
    update: function() {
        this.move();
        this.sprite.position.x = this.position;
    }
};

var ship = new Ship();
var asteroids = [
    new Asteroid(1000, -1),
]

var MainState = function() {};
MainState.prototype = {
    worldLength: 20,
    tileSize: 64,
    xOffset: 43,
    yPosition: (768 / 2) - 32,
    tileScale: undefined,

    gameover: false,

    blopp2SFX: undefined,

    thrusting: false,

    shootRate: 250, // time must pass between shots
    shootLast: 0,
    bullets: [],
    bulletSpeed: 5,

    preload: function() {
        // allow the player to right click without the menu popping up
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        this.tileScale = this.tileSize / 16;
        game.load.image('bg',         'assets/sprites/bg.png');
        game.load.image('asteroid_l', 'assets/sprites/asteroid_big.png');
        game.load.image('asteroid_m', 'assets/sprites/asteroid_med.png');
        game.load.image('asteroid_s', 'assets/sprites/asteroid_small.png');
        game.load.image('bullet',     'assets/sprites/bullet.png');
        game.load.image('ship',       'assets/sprites/ship.png');
        game.load.image('thrust',     'assets/sprites/thrust.png');

        game.load.audio('blopp2',    'assets/sfx/blopp2.wav');
        game.load.audio('explosion', 'assets/sfx/explosion.wav');

	    game.load.script('utilScript',          '../js/util.js');
	    game.load.script('directionEnumScript', '../js/direction.enum.js');
	    game.load.script('keycodesScript',      '../js/keycodes.js');

        // necessary to preload the font lol
        game.add.text(0, 0, "", {font: '56px pixelbug', fill: '#ffffff'});
    },
    create: function() {
        var self = this;
        game.add.sprite(0, 0, 'bg');
        game.stage.backgroundColor = "#AAAAAA";
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        this.shootSFX = game.add.audio('blopp2');
        this.thrustSFX = game.add.audio('thrust');
        this.explosionSFX = game.add.audio('explosion');
        this.winSFX = game.add.audio('thrust');
        this.loseSFX = game.add.audio('thrust');

        this.shipSprite = game.add.sprite(ship.position + this.xOffset, this.yPosition, 'ship');
        this.shipSprite.scale.set(this.tileScale, this.tileScale);

        this.thrustSprite = game.add.sprite(ship.position + this.xOffset - 64, this.yPosition, 'thrust');
        this.thrustSprite.scale.set(this.tileScale, this.tileScale);
        this.thrustSprite.visible = false;

        asteroids.forEach(function(asteroid) {
            var asteroidSprite = game.add.sprite(asteroid.position, self.yPosition + asteroid.yOffset, asteroid.type);
            asteroidSprite.scale.set(self.tileScale, self.tileScale);
            asteroidSprite.anchor.setTo(0.5, 0.5);
            asteroidSprite.angle = util.randomInt(-180, 180);
            asteroid.sprite = asteroidSprite;
        })

        game.input.keyboard.onDownCallback = function(event) {
            if(keycodes.right.includes(event.key) || keycodes.up.includes(event.key)) {
                self.thrusting = true;
            }
            if(keycodes.space.includes(event.key)) {
                if(self.mayShoot()) {
                    self.shoot();
                }
            }
            else if(keycodes.restart.includes(event.key)) {
                // R restart
                ship.reset();
                game.stage.backgroundColor = "#FFFFFF";
                game.state.start('MainState');
            }
        };
        game.input.keyboard.onUpCallback = function(event) {
            if(keycodes.right.includes(event.key) || keycodes.up.includes(event.key)) {
                self.thrusting = false;
            }
        }
    },
    update: function() {
        if(!this.gameover) {
            ship.update();
            this.shipSprite.position.x = ship.position;
            if(this.thrusting) {
                this.thrustSprite.position.x = this.shipSprite.position.x - 64;
                this.thrustSprite.visible = true;
                this.thrustSFX.play();
                ship.thrust();
            }
            else {
                this.thrustSprite.visible = false;
            }

            this.updateBullets();
            this.updateAsteroids();
            this.updateCollisions();

            if(this.checkWin()) {
                this.win();
            }
            else if(this.checkLose()) {
                this.lose();
            }
        }
    },
    mayShoot: function() {
        var ja = false;
        if(Date.now() - this.shootLast >= this.shootRate) {
            this.shootLast = Date.now();
            ja = true;
        }
        return ja;
    },
    shoot: function() {
        var bullet = game.add.sprite(ship.position + 60, this.yPosition + 28, 'bullet');
        bullet.scale.set(this.tileScale, this.tileScale);
        this.bullets.push(bullet);
        this.shootSFX.play();
    },
    updateAsteroids: function() {
        var self = this;
        asteroids.forEach(function(asteroid) {
            asteroid.update();
        })
    },
    updateBullets: function() {
        var self = this;
        this.bullets.forEach(function(bullet) {
            bullet.position.x += self.bulletSpeed;
            if(bullet.position.x > 1500) {
                // clear
            }
        })
    },
    checkBulletCollisions: function() {
        var asteroidsToDestroy = [];
        this.bullets.forEach(function(bullet) {
            asteroids.forEach(function(asteroid) {
                if(bullet.x + 2 > asteroid.position - asteroid.radius) {
                    asteroidsToDestroy.push(asteroid);
                    bullet.destroy();
                }
            })
        })
        asteroidsToDestroy.forEach(function(asteroid) {
            if(asteroid.type == 'asteroid_l') {
                var a_1 = new Asteroid(asteroid.position, -1);
                var sprite1 = game.add.sprite(asteroid.position, self.yPosition + asteroid.yOffset, 'asteroid_m');
                sprite1.scale.set(self.tileScale, self.tileScale);
                sprite1.anchor.setTo(0.5, 0.5);
                sprite1.angle = util.randomInt(-180, 180);
                a_1.sprite = sprite1;

                var a_2 = new Asteroid(asteroid.position, 1);
                var sprite2 = game.add.sprite(asteroid.position, self.yPosition + asteroid.yOffset, 'asteroid_m');
                sprite2.scale.set(self.tileScale, self.tileScale);
                sprite2.anchor.setTo(0.5, 0.5);
                sprite2.angle = util.randomInt(-180, 180);
                a_2.sprite = sprite2;

                asteroids.push(a_1)
                asteroids.push(a_2)
            }
            else if(asteroid.type == 'asteroid_m') {
                var a_1 = new Asteroid(asteroid.position, -1);
                var sprite1 = game.add.sprite(asteroid.position, self.yPosition + asteroid.yOffset, 'asteroid_s');
                sprite1.scale.set(self.tileScale, self.tileScale);
                sprite1.anchor.setTo(0.5, 0.5);
                sprite1.angle = util.randomInt(-180, 180);
                a_1.sprite = sprite1;

                var a_2 = new Asteroid(asteroid.position, 1);
                var sprite2 = game.add.sprite(asteroid.position, self.yPosition + asteroid.yOffset, 'asteroid_s');
                sprite2.scale.set(self.tileScale, self.tileScale);
                sprite2.anchor.setTo(0.5, 0.5);
                sprite2.angle = util.randomInt(-180, 180);
                a_2.sprite = sprite2;

                asteroids.push(a_1)
                asteroids.push(a_2)
            }
            else if(asteroid.type == 'asteroid_s') {
                this.asteroidsDestroyed++;
            }
            asteroid.sprite.destroy();
            var index = asteroids.indexOf(asteroid);
            asteroids.splice(index, 1);
            this.explosionSFX.play();
        })
        asteroidsToDestroy = [];
    },
    checkShipCollisions: function() {
    },
    updateCollisions: function() {
        this.checkBulletCollisions();
        this.checkShipCollisions();
    },
    checkLose: function() {
        return this.shipDestroyed;
    },
    checkWin: function() {
        return this.asteroidsDestroyed >= 7;
    },
    win: function() {
        var gameOverText = game.add.text(game.world.width / 2, yPos, "YOU WIN!",
            {font: '56px pixelbug', fill: '#ffffff'});
        util.recentreText(gameOverText);
        this.gameover = true;
        this.winSFX.play();
    },
    lose: function(index) {
        var gameOverText = game.add.text(game.world.width / 2, yPos, "YOU LOSE!",
            {font: '56px pixelbug', fill: '#ffffff'});
        util.recentreText(gameOverText);
        this.gameover = true;
        this.loseSFX.play();
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
