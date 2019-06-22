'use strict';

var SCREEN_WIDTH = 1366;
var game = new Phaser.Game(SCREEN_WIDTH, 768, Phaser.AUTO, '', null, false, false);

var Ship = function() {};
Ship.prototype = {
    speed: 0,
    acceleration: 0.05,
    position: 0,
    sprite: undefined,
    wrapSprite: undefined,
    thrust: function() {
        this.speed += this.acceleration;
    },
    update: function() {
        this.position += this.speed;
        if(this.position > SCREEN_WIDTH) { // wrapping rightwards
            this.position = this.position - SCREEN_WIDTH;
        }
        this.sprite.position.x = this.position;
        this.wrapSprite.position.x = this.position - SCREEN_WIDTH;
    },
    reset: function() {
        this.speed = 0;
        this.position = 0;
    }
};

var Bullet = function(pos_x, pos_y, scale) {
    this.sprite = game.add.sprite(pos_x, pos_y, 'bullet');
    this.sprite.scale.set(scale, scale);
    this.wrapSprite = game.add.sprite(pos_x, pos_y, 'bullet');
    this.wrapSprite.scale.set(scale, scale);
};

var Asteroid = function(position, velocity, type) {
    this.type = type || 'asteroid_l';
    this.sprite = undefined;
    this.wrapSprite = undefined; // for wrapping around the screen
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
    update: function() {
        this.position += this.velocity;
        if(this.position > SCREEN_WIDTH) { // wrapping rightwards
            this.position = this.position - SCREEN_WIDTH;
        }
        this.sprite.position.x = this.position;
        this.wrapSprite.position.x = this.position - SCREEN_WIDTH;
    }
};

var MainState = function() {};
MainState.prototype = {
    worldLength: 20,
    tileSize: 64,
    yPosition: (768 / 2) - 32,
    tileScale: undefined,

    gameOver: false,
    thrusting: false,

    shootRate: 250, // time must pass between shots
    shootLast: 0,
    bullets: [],
    bulletSpeed: 5,

    ship: new Ship(),
    asteroids: [new Asteroid(1000, -1),],
    score: 0,
    preload: function() {
        // allow the player to right click without the menu popping up
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        this.tileScale = this.tileSize / 16;
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
    createAsteroidSprite: function(xPosition, yOffset, type) {
        var asteroidSprite = game.add.sprite(xPosition, this.yPosition + yOffset, type);
        asteroidSprite.scale.set(this.tileScale, this.tileScale);
        asteroidSprite.anchor.setTo(0.5, 0.5);
        asteroidSprite.angle = util.randomInt(-180, 180);
        return asteroidSprite;
    },
    create: function() {
        var self = this;
        game.stage.backgroundColor = "#000000";
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        this.shootSFX = game.add.audio('blopp2');
        this.explosionSFX = game.add.audio('explosion');
        this.winSFX = game.add.audio('thrust');
        this.loseSFX = game.add.audio('thrust');

        this.ship.sprite = game.add.sprite(this.ship.position, this.yPosition, 'ship');
        this.ship.wrapSprite = game.add.sprite(this.ship.position, this.yPosition, 'ship');
        this.ship.sprite.scale.set(this.tileScale, this.tileScale);
        this.ship.wrapSprite.scale.set(this.tileScale, this.tileScale);

        this.thrustSprite = game.add.sprite(this.ship.position - 64, this.yPosition, 'thrust');
        this.thrustSprite.scale.set(this.tileScale, this.tileScale);
        this.thrustSprite.visible = false;

        this.asteroids.forEach(function(asteroid) {
            asteroid.sprite = self.createAsteroidSprite(asteroid.position, asteroid.yOffset, asteroid.type);
            asteroid.wrapSprite = self.createAsteroidSprite(asteroid.position - SCREEN_WIDTH, asteroid.yOffset, asteroid.type);
        })

        game.input.keyboard.onDownCallback = function(event) {
            if(!self.gameOver) {
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
                    this.ship.reset();
                    game.stage.backgroundColor = "#FFFFFF";
                    game.state.start('MainState');
                }
            }
        };
        game.input.keyboard.onUpCallback = function(event) {
            if(!self.gameOver) {
                if(keycodes.right.includes(event.key) || keycodes.up.includes(event.key)) {
                    self.thrusting = false;
                }
            }
        }
    },
    update: function() {
        this.ship.update();
        if(this.thrusting) {
            this.thrustSprite.position.x = this.ship.sprite.position.x - 64;
            this.thrustSprite.visible = true;
            this.ship.thrust();
        }
        else {
            this.thrustSprite.visible = false;
        }
        this.updateBullets();
        this.updateAsteroids();

        if(!this.gameOver) {
            this.updateCollisions();
            if(this.checkWin()) { this.gameOverF("YOU WIN!"); }
            else if(this.checkLose()) { this.gameOverF("YOU LOSE!"); }
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
        this.bullets.push(new Bullet(this.ship.position + 60, this.yPosition + 28, this.tileScale));
        this.shootSFX.play();
    },
    updateAsteroids: function() {
        this.asteroids.forEach(function(asteroid) {
            asteroid.update();
        })
    },
    updateBullets: function() {
        var self = this;
        this.bullets.forEach(function(bullet) {
            bullet.sprite.position.x += self.bulletSpeed;
            if(bullet.sprite.position.x > SCREEN_WIDTH) { // wrapping rightwards
                bullet.sprite.position.x = bullet.sprite.position.x - SCREEN_WIDTH;
            }
            bullet.wrapSprite.position.x = bullet.sprite.position.x - SCREEN_WIDTH;
        })
    },
    checkBulletCollisions: function() {
        var self = this;
        var asteroidsToDestroy = [];
        var bulletsToDestroy = [];
        this.bullets.forEach(function(bullet) {
            self.asteroids.forEach(function(asteroid) {
                if(bullet.sprite.overlap(asteroid.sprite) || bullet.wrapSprite.overlap(asteroid.sprite)) {
                    asteroidsToDestroy.push(asteroid);
                    bulletsToDestroy.push(bullet);
                }
            })
        })
        asteroidsToDestroy.forEach(function(asteroid) {
            self.score++;
            if(asteroid.type == 'asteroid_l') {
                var a_1 = new Asteroid(asteroid.position, -1, 'asteroid_m');
                a_1.sprite = self.createAsteroidSprite(a_1.position, a_1.yOffset, 'asteroid_m');
                a_1.wrapSprite = self.createAsteroidSprite(a_1.position - SCREEN_WIDTH, a_1.yOffset, 'asteroid_m');

                var a_2 = new Asteroid(asteroid.position, 1, 'asteroid_m');
                a_2.sprite = self.createAsteroidSprite(a_2.position, a_2.yOffset, 'asteroid_m');
                a_2.wrapSprite = self.createAsteroidSprite(a_2.position - SCREEN_WIDTH, a_2.yOffset, 'asteroid_m');

                self.asteroids.push(a_1)
                self.asteroids.push(a_2)
            }
            else if(asteroid.type == 'asteroid_m') {
                var a_1 = new Asteroid(asteroid.position, -1, 'asteroid_s');
                a_1.sprite = self.createAsteroidSprite(a_1.position, a_1.yOffset, 'asteroid_s');
                a_1.wrapSprite = self.createAsteroidSprite(a_1.position - SCREEN_WIDTH, a_1.yOffset, 'asteroid_s');

                var a_2 = new Asteroid(asteroid.position, 1, 'asteroid_s');
                a_2.sprite = self.createAsteroidSprite(a_2.position, a_2.yOffset, 'asteroid_s');
                a_2.wrapSprite = self.createAsteroidSprite(a_2.position - SCREEN_WIDTH, a_2.yOffset, 'asteroid_s');

                self.asteroids.push(a_1)
                self.asteroids.push(a_2)
            }
            asteroid.sprite.destroy();
            self.asteroids.splice(self.asteroids.indexOf(asteroid), 1);
            self.explosionSFX.play();
        })
        asteroidsToDestroy = [];
        bulletsToDestroy.forEach(function(bullet) {
            var index = self.bullets.indexOf(bullet);
            self.bullets.splice(index, 1);
            bullet.sprite.destroy();
            bullet.wrapSprite.destroy();
        })
        bulletsToDestroy = [];
    },
    checkShipCollisions: function() {
        var self = this;
        if(!this.shipDestroyed) {
            this.asteroids.forEach(function(asteroid) {
                if(self.ship.sprite.overlap(asteroid.sprite) || self.ship.wrapSprite.overlap(asteroid.sprite)) {
                    self.shipDestroyed = true;
                }
            })
        }
        if(this.shipDestroyed) {
            this.ship.sprite.destroy();
            this.ship.wrapSprite.destroy();
            this.explosionSFX.play();
        }
    },
    updateCollisions: function() {
        this.checkBulletCollisions();
        this.checkShipCollisions();
    },
    checkLose: function() {
        return this.shipDestroyed;
    },
    checkWin: function() {
        return this.asteroids.length == 0;
    },
    gameOverF: function(text) {
        var gameOverText = game.add.text(game.world.width / 2, this.yPosition - 230, text,
            {font: '56px pixelbug', fill: '#ffffff'});
        var highScoreText = game.add.text(game.world.width / 2, this.yPosition - 150, "High score: " + this.score, {font: '48px pixelbug', fill: '#ffffff'});
        var scoreText = game.add.text(game.world.width / 2, this.yPosition - 60, "Your score: " + this.score, {font: '48px pixelbug', fill: '#ffffff'});
        util.recentreText(gameOverText);
        util.recentreText(scoreText);
        util.recentreText(highScoreText);

        this.gameOver = true;
        this.thrustSprite.destroy();
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
