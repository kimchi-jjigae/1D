'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var Ship = function() {};
Ship.prototype = {
    speed: 0,
    acceleration: 0.05,
    position: 0,
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

var Asteroid = function(position, velocity) {
    this.position = position;
    this.velocity = velocity;
};
Asteroid.prototype = {
    move: function() {
        this.position += this.velocity;
    },
    update: function() {
        this.move();
    }
};

var ship = new Ship();
var asteroids = [
    new Asteroid(800, -1)
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

        game.input.keyboard.onDownCallback = function(event) {
            if(keycodes.right.includes(event.key) || keycodes.up.includes(event.key)) {
                self.thrusting = true;
            }
            if(keycodes.space.includes(event.key)) {
                if(self.mayShoot) {
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
            this.shipSprite.position.x = ship.position + this.xOffset;
            if(this.thrusting) {
                this.thrustSprite.position.x = this.shipSprite.position.x - 64;
                this.thrustSprite.visible = true;
                this.thrustSFX.play();
                ship.thrust();
            }
            else {
                this.thrustSprite.visible = false;
            }
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
        if(Date.now() - this.shootLast >= this.ShootRate) {
            this.shootLast = Date.now();
            ja = true;
        }
        return ja;
    },
    shoot: function() {
    },
    checkBulletCollisions: function() {
        this.bullets.forEach(function(bullet) {
            asteroids.forEach(function(asteroid) {
                //if(m
            })
        })
    },
    checkShipCollisions: function() {
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
