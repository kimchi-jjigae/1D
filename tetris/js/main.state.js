'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var MainState = function() {};

MainState.prototype = {
    worldHeight: 20,
    tileSize: 32,
    yOffset: 64,
    xPosition: (1366 / 2) - 16,

    tickRate: 300,
    lastTicked: Date.now(),
    tetrising: false,

    linePiece: undefined,
    linePos: 0,

    tetrisSFX: undefined,
    flashRate: 200,
    lastFlashed: Date.now(),

    score: 0,
    level: 1,
    scoreText: undefined,
    levelText: undefined,
    nextPieceText: undefined,

    preload: function() {
        game.load.image('bg', 'assets/sprites/bg.png');
        game.load.spritesheet('block', 'assets/sprites/block.png', 16, 64, 2);

        game.load.audio('tetris', 'assets/sfx/gameover.wav');

	    game.load.script('utilScript',          '../js/util.js');
	    game.load.script('directionEnumScript', '../js/direction.enum.js');
	    game.load.script('keycodesScript',      '../js/keycodes.js');
        game.add.text(0, 0, "", {font: '56px pixelbug', fill: '#ffffff'});
    },
    create: function() {
        game.add.sprite(0, 0, 'bg');
        game.stage.backgroundColor = "#FFFFFF";
        game.scale.pageAlignHorizontally = true;  game.scale.pageAlignVertically = true;
        var tileScale = this.tileSize / 16;

        this.tetrisSFX = game.add.audio('tetris');

        this.linePiece = game.add.sprite(this.xPosition, this.linePos * this.tileSize + this.yOffset, 'block');
        this.linePiece.scale.set(tileScale, tileScale);

        var self = this;
        game.input.keyboard.onDownCallback = function(event) {
            if(keycodes.down.includes(event.key)) {
                self.lastTicked = 0;
            }
            else if(keycodes.space.includes(event.key)) {
            }
        };
        this.scoreText = game.add.text(50, 80, "Score: 0", {font: '56px pixelbug', fill: '#ffffff'});
        this.levelText = game.add.text(50, 160, "Level: 1", {font: '56px pixelbug', fill: '#ffffff'});
        this.nextPieceText = game.add.text(50, 220, "Next piece:", {font: '56px pixelbug', fill: '#ffffff'});
        game.stage.smoothed = false;
    },
    update: function() {
        if(this.timeToTick() && !this.tetrising) {
            ++this.linePos;
            this.linePiece.position.y = this.linePos * this.tileSize + this.yOffset;

            this.checkTetris();

            /*
            if(this.eatApple()) {
                this.score++;
                this.scoreText.text = "Score: " + this.score;

                snake.grow();
                var tileScale = this.tileSize / 16;
                var pos = (snake.position - snake.length + 1) % this.worldLength;
                var bit = this.snakeBits.create(pos * this.tileSize + this.xOffset, this.yPosition, 'snake');
                bit.scale.set(tileScale, tileScale);

                this.blopp.play();

                if(snake.length < this.worldLength) {
                    apple.respawn(snake.position, snake.length, this.worldLength);
                    this.appleBit.position.x = apple.position * this.tileSize + this.xOffset;
                }
                else {
                    this.appleBit.destroy();
                }
            }
            */
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
        this.tetrising = this.linePos == this.worldHeight - 4;
    },
    tetris: function() {
        //this.tetrisSFX.play();
        if(Date.now() - this.lastFlashed > this.flashRate) {
            var frame = this.linePiece.frame;
            this.linePiece.frame = frame == 0 ? 1 : 0;
            this.lastFlashed = Date.now();
        }
    }
};

game.state.add('MainState', MainState);
game.state.start('MainState');
