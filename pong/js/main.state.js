'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var MainState = function() {};
MainState.prototype = {
    button1: undefined,
    button2: undefined,

    worldLength: 40,
    tileSize: 32,
    xOffset: 43,
    yPosition: (768 / 2) - 32,

    paddle1Position: 0,
    paddle2Position: 39,
    ballPosition: 19,
    ballVelocity: -0.5,

    paddle1Sprite: undefined,
    paddle2Sprite: undefined,
    ballSprite:    undefined,

    score1Text: undefined,
    score2Text: undefined,

    blopp1SFX: undefined,
    blopp2SFX: undefined,

    started: false,
    startGame: function() {
        this.button1.visible = false;
        this.button2.visible = false;

        this.ballSprite.visible = true;
        if(util.randomBool()) {
            this.ballVelocity *= -1;
        }

        this.started = true;
    },

    preload: function() {
        game.load.spritesheet('button1', 'assets/sprites/button1.png', 200, 60, 2);
        game.load.spritesheet('button2', 'assets/sprites/button2.png', 200, 60, 2);

        game.load.image('paddle',  'assets/sprites/paddle.png');
        game.load.image('paddle2', 'assets/sprites/paddle2.png');
        game.load.image('ball',    'assets/sprites/ball.png');
        game.load.image('bg',      'assets/sprites/bg.png');

        game.load.audio('blopp1',  'assets/sfx/blopp2.wav');

	    game.load.script('utilScript',          'js/util.js');
	    game.load.script('directionEnumScript', 'js/direction.enum.js');
	    game.load.script('keycodesScript',      'js/keycodes.js');
        // necessary to preload the font lol
        game.add.text(0, 0, "", {font: '56px pixelbug', fill: '#ffffff'});
    },
    create: function() {
        game.add.sprite(0, 0, 'bg');
        game.stage.backgroundColor = "#FFFFFF";
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        var tileScale = this.tileSize / 8;

        this.button1 = game.add.button(481, 200, 'button1', this.startGame, this, 1, 0, 1);
        this.button2 = game.add.button(685, 200, 'button2', this.startGame, this, 1, 0, 1);

        this.blopp1SFX = game.add.audio('blopp1');

        this.paddle1Sprite = game.add.sprite(this.paddle1Position * this.tileSize + this.xOffset, this.yPosition, 'paddle');
        this.paddle1Sprite.scale.set(tileScale, tileScale);

        this.paddle2Sprite = game.add.sprite(this.paddle2Position * this.tileSize + this.xOffset, this.yPosition, 'paddle2');
        this.paddle2Sprite.scale.set(tileScale, tileScale);

        this.ballSprite = game.add.sprite(this.ballPosition * this.tileSize + this.xOffset, this.yPosition, 'ball');
        this.ballSprite.scale.set(tileScale, tileScale);
        this.ballSprite.visible = false;

        var self = this;
        game.input.keyboard.onDownCallback = function(event) {
            if(keycodes.restart.includes(event.key)) {
                // R restart
                self.ballPosition = 19;
                self.ballVelocity = -0.5;
                game.stage.backgroundColor = "#FFFFFF";
                game.state.start('MainState');
                if(util.randomBool()) {
                    self.ballVelocity *= -1;
                }
            }
        };
        this.score1Text = game.add.text(this.xOffset, 0, "0", {font: '56px pixelbug', fill: '#ffffff'});
        this.score2Text = game.add.text(1300, 0, "0", {font: '56px pixelbug', fill: '#ffffff'});
    },
    update: function() {
        if(this.started) {
            this.ballPosition += this.ballVelocity;
            this.ballSprite.position.x = this.ballPosition * this.tileSize + this.xOffset;

            if(this.ballPosition <= this.paddle1Position + 1 ||
                this.ballPosition >= this.paddle2Position - 1) {
                this.ballVelocity *= -1;
                this.blopp1SFX.play();
            }
        }
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
