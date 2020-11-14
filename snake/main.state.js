'use strict';

//var game = new Phaser.Game(world.w, world.h, Phaser.AUTO, '', null, false, false);
var game = new Phaser.Game("100%", "100%", Phaser.AUTO, '', null, false, false);

var Snake = function() {};
Snake.prototype = {
    length: 4,
    position: 4,
    grow: function() {
        this.length++;
    },
    reset: function() {
        this.length = 4;
        this.position = 4;
    }
};

var Apple = function() {};
Apple.prototype = {
    position: 8,
    respawn: function(snakePosition, snakeLength, worldLength) {
        var head = snakePosition % worldLength;
        var tail = ((snakePosition - snakeLength) % worldLength) + 1;

        var newPos = util.randomInt(20);
        while(withinSnake(newPos, head, tail)) {
            newPos = util.randomInt(20);
        }
        this.position = newPos;

        function withinSnake(applePos, head, tail) {
            if(head > tail) {
                return applePos >= tail && applePos <= head
            }
            else {
                return applePos <= head || applePos >= tail;
            }
        }
    },
	reset: function() {
        this.position = 8;
    }
};

var snake = new Snake();
var apple = new Apple();

var MainState = function() {};

MainState.prototype = {
    tickRate: 300,
    lastTicked: Date.now(),

    sceneGroup: undefined,
    snakeBits: undefined,
    appleBit: undefined,

    uiGroup: undefined,
    scoreText: undefined,
    gameOverText: undefined,
    highScoreText: undefined,
    scoreText: undefined,
    restartButton: undefined,

    score: 0,
    gameOver: false,

    blopp: undefined,
    gameoverSFX: undefined,

    preload: function() {
        /* load all assets here */
        game.load.image('head',  getSpritePath('snakehead'));
        game.load.image('snake', getSpritePath('snakebody'));
        game.load.image('apple', getSpritePath('apple'));
        game.load.image('bgtile',    getSpritePath('bgtile'));
        game.load.spritesheet('button', getSpritePath('button-200x60'), 200, 60, 2);

        game.load.audio('blopp',    getSfxPath('blopp1'));
        game.load.audio('gameover', getSfxPath('gameover'));

	    game.load.script('utilScript', getScriptPath('util'));
	    game.load.script('directionEnumScript', getScriptPath('direction.enum'));
	    game.load.script('keycodesScript',      getScriptPath('keycodes'));
        // necessary for loading the font:
        game.add.text(0, 0, "", textStyle.large);
    },
    restart: function() {
        this.score = 0;
        this.gameOver = false;

        snake.reset();
        apple.reset();

        this.createSceneSprites();

        this.scoreText.destroy();
        this.scoreText = game.add.text(world.xOffset, 0, "Score: 0", textStyle.large);
        if(this.gameOverText) {
            this.gameOverText.visible = false;
            this.highScoreText.visible = false;
        }
        this.restartButton.visible = false;
    },
    createSceneSprites: function() {
        if(this.sceneGroup) this.sceneGroup.destroy();
        this.sceneGroup = game.add.group();
        this.bgTiles = game.add.group();
        this.snakeBits = game.add.group();

        util.createTileBg(this.bgTiles, world.length, 'bgtile', world.tileSize, world.xOffset, world.yOffset);
        var bit = this.snakeBits.create((snake.position) * world.tileSize + world.xOffset, world.yOffset, 'head');
        for(var i = 1; i < snake.length; ++i) {
            bit = this.snakeBits.create((snake.position - i) * world.tileSize + world.xOffset, world.yOffset, 'snake');
        }
        this.appleBit = game.add.sprite(apple.position * world.tileSize + world.xOffset, world.yOffset, 'apple');

        this.sceneGroup.addChild(this.bgTiles);
        this.sceneGroup.addChild(this.snakeBits);
        this.sceneGroup.addChild(this.appleBit);
        this.sceneGroup.scale.set(4, 4);
    },
/*
    rescale: function() {
        // the game doesn't resize reight away, so we need to delay here
        setTimeout(function() {
            game.scale.orientationSprite.scale.set(game.game.width / game.scale.width, game.game.height / game.scale.height);
        }, 100);   
    },
*/
    create: function() {
        /* set up game objects here */
        // Maintain aspect ratio & center    
        //game.scale.forceOrientation(true);
        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
/*
        if (!game.device.desktop) {
            game.scale.forceOrientation(false, true, 'orientation');
            game.scale.enterIncorrectOrientation.add(this.rescale);
        }
*/
        /* scene sprites */
        game.stage.backgroundColor = colour.bg;
        game.stage.smoothed = false;
        this.createSceneSprites();

        /* ui sprites */
        this.scoreText = game.add.text(world.xOffset, 0, "Score: 0", textStyle.large);

        /* sfx */
        this.blopp = game.add.audio('blopp');
        this.gameoverSFX = game.add.audio('gameover');

        /* input */

        var self = this;
        game.input.keyboard.onDownCallback = function(event) {
            if(keycodes.right.includes(event.key)) {
                // → right
                self.lastTicked = 0;
            }
            else if(keycodes.restart.includes(event.key)) {
                // R restart
                self.restart()
            }
        };
    },
    update: function() {
        if(this.timeToTick() && !this.gameOver) {
            snake.position++;
            for(var i = 0; i < this.snakeBits.length; ++i) {
                var bit = this.snakeBits.children[i];
                var pos = (snake.position - i) % world.length;
                bit.position.x = pos * world.tileSize + world.xOffset;
            }
            if(!this.gameOver && this.eatTail()) {
                var yPos = 100;
                this.scoreText.destroy()
                this.gameOverText = game.add.text(game.world.width / 2, yPos, "GAME OVER!", textStyle.large);
                this.highScoreText = game.add.text(game.world.width / 2, yPos + 60, "High score: " + this.score, textStyle.small);
                this.scoreText = game.add.text(game.world.width / 2, yPos + 120, "Your score: " + this.score, textStyle.small);
                util.recentreText(this.gameOverText);
                util.recentreText(this.scoreText);
                util.recentreText(this.highScoreText);
                //this.gameoverSFX.play();
                this.restartButton = game.add.button(game.world.width / 2, 290, 'button', this.restart, this, 1, 0, 1);
                util.recentreText(this.restartButton);
                this.gameOver = true;
            }
            else if(this.eatApple()) {
                this.score++;
                this.scoreText.text = "Score: " + this.score;

                snake.grow();
                var pos = (snake.position - snake.length + 1) % world.length;
                var bit = this.snakeBits.create(pos * world.tileSize + world.xOffset, world.yOffset, 'snake');

                //this.blopp.play();

                if(snake.length < world.length) {
                    apple.respawn(snake.position, snake.length, world.length);
                    this.appleBit.position.x = apple.position * world.tileSize + world.xOffset;
                }
                else {
                    this.appleBit.destroy();
                }
            }
        }
        else if(this.gameOver) {
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
    eatApple: function() {
        return (snake.position % world.length) == apple.position
    },
    eatTail: function() {
        var head = snake.position % world.length;
        var tail = (snake.position - snake.length) % world.length;
        return head == tail;
    }
};

game.state.add('MainState', MainState);
game.state.start('MainState');
