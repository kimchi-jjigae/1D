'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var MainState = function() {};

MainState.prototype = {
    worldHeight: 20,
    tileSize: 32,
    yOffset: 64,
    xPosition: 400 - 16,

    tickRate: 500,
    lastTicked: Date.now(),
    tetrising: false,

    linePiece: undefined,
    linePos: 0,

    tetrisSFX: undefined,
    blippSFX: undefined,
    flashRate: 200,
    lastFlashed: Date.now(),
    flashes: 6,
    maxFlashes: 6,

    score: 0,
    scoreThreshold: 2000,
    level: 1,
    scoreText: undefined,
    levelText: undefined,
    nextPieceText: undefined,

    preload: function() {
        game.load.image('bg', 'assets/sprites/bg.png');
        game.load.spritesheet('block', 'assets/sprites/block.png', 16, 64, 2);

        game.load.audio('blipp', 'assets/sfx/blip.wav');
        game.load.audio('tetris', 'assets/sfx/blarp.wav');

	    game.load.script('utilScript',          '../js/util.js');
	    game.load.script('directionEnumScript', '../js/direction.enum.js');
	    game.load.script('keycodesScript',      '../js/keycodes.js');
        game.add.text(0, 0, "", {font: '32px pixelbug', fill: '#ffffff'});
    },
    create: function() {
        game.add.sprite(0, 0, 'bg');
        game.stage.backgroundColor = "#FFFFFF";
        game.scale.pageAlignHorizontally = true;  game.scale.pageAlignVertically = true;
        var tileScale = this.tileSize / 16;

        this.tetrisSFX = game.add.audio('tetris');
        this.blippSFX = game.add.audio('blipp');

        this.linePiece = game.add.sprite(this.xPosition, this.linePos * this.tileSize + this.yOffset, 'block');
        this.linePiece.scale.set(tileScale, tileScale);

        var self = this;
        game.input.keyboard.onDownCallback = function(event) {
            if(!self.tetrising) {
                if(keycodes.down.includes(event.key)) {
                    self.lastTicked = 0;
                }
                else if(keycodes.up.includes(event.key) ||
                    keycodes.space.includes(event.key)) {
                    self.lastTicked = 0;
                    self.linePos = self.worldHeight - 5;

                    self.tetrisSFX.play();
                }
            }
        };
        this.scoreText = game.add.text(50, 80, "Score: 0", {font: '32px pixelbug', fill: '#ffffff'});
        this.levelText = game.add.text(50, 120, "Level: 1", {font: '32px pixelbug', fill: '#ffffff'});
        this.nextPieceText = game.add.text(50, 160, "Next piece:", {font: '32px pixelbug', fill: '#ffffff'});
        game.stage.smoothed = false;

        var sprite = game.add.sprite(70, 220, 'block');
        sprite.scale.set(tileScale, tileScale);
    },
    update: function() {
        if(this.timeToTick() && !this.tetrising) {
            this.blippSFX.play();
            ++this.linePos;
            this.linePiece.position.y = this.linePos * this.tileSize + this.yOffset;

            this.checkTetris();
            if(this.tetrising) {
                this.tetrisSFX.play();
            }
        }
        else if(this.tetrising) {
            this.tetris();
        }
    },
    timeToTick: function() {
        var itIsTime = false;
        if(Date.now() - this.lastTicked >= this.tickRate) {
            this.lastTicked = Date.now();
            itIsTime = true;
        }
        return itIsTime;
    },
    checkTetris: function() {
        this.tetrising = this.linePos >= this.worldHeight - 4;
    },
    tetris: function() {
        if(Date.now() - this.lastFlashed > this.flashRate) {
            var frame = this.linePiece.frame;
            this.linePiece.frame = frame == 0 ? 1 : 0;
            this.lastFlashed = Date.now();
            --this.flashes;
        }
        if(this.flashes <= 0) {
            this.lastTicked = Date.now();
            this.tetrising = false;
            this.flashes = this.maxFlashes;

            this.score += 800;
            this.scoreText.text = "Score: " + this.score;

            var oldLevel = this.level;
            this.level = Math.floor(this.score / this.scoreThreshold) + 1; 
            this.levelText.text = "Level: " + this.level;
            if(this.level != oldLevel) {
                this.tickRate -= 20;
                if(this.tickRate <= 20)
                    this.tickRate = 20;
            }

            this.linePos = -1;
        }
    }
};

game.state.add('MainState', MainState);
game.state.start('MainState');
