'use strict';

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
        game.add.text(0, 0, "", textStyle.fg(56));
    },
    restart: function() {
        this.score = 0;
        this.gameOver = false;

        snake.reset();
        apple.reset();

        this.createSceneSprites();
        this.createUiSprites();
        this.rescale();
    },
    createSceneSprites: function() {
        if(this.sceneGroup) this.sceneGroup.destroy();
        this.sceneGroup = game.add.group();
        this.bgTiles = game.add.group();
        this.snakeBits = game.add.group();

        util.createTileBg(this.bgTiles, world.length, 'bgtile', world.tileSize, 0);
        var bit = this.snakeBits.create((snake.position) * world.tileSize, 0, 'head');
        for(var i = 1; i < snake.length; ++i) {
            bit = this.snakeBits.create((snake.position - i) * world.tileSize, 0, 'snake');
        }
        this.appleBit = game.add.sprite(apple.position * world.tileSize, 0, 'apple');

        this.sceneGroup.addChild(this.bgTiles);
        this.sceneGroup.addChild(this.snakeBits);
        this.sceneGroup.addChild(this.appleBit);
        this.scaleSceneSprites();
    },
    createUiSprites: function() {
        if(this.uiGroup) this.uiGroup.destroy();
        this.uiGroup = game.add.group();

        this.scoreText = game.add.text(world.xMargin, world.yMargin, "Score: 0", textStyle.fg(56));
        this.gameOverText = game.add.text(0, 0, "GAME OVER!", textStyle.fg(56));
        this.highScoreText = game.add.text(0, 0, "High score: ", textStyle.fg(32));
        this.endScoreText = game.add.text(0, 0, "Your score: ", textStyle.fg(32));
        this.restartButton = game.add.button(0, 0, 'button', this.restart, this, 1, 0, 1);

        this.gameOverText.visible = false;
        this.highScoreText.visible = false;
        this.endScoreText.visible = false;
        this.restartButton.visible = false;

        this.uiGroup.addChild(this.scoreText);
        this.uiGroup.addChild(this.gameOverText);
        this.uiGroup.addChild(this.highScoreText);
        this.uiGroup.addChild(this.endScoreText);
        this.uiGroup.addChild(this.restartButton);
        this.scaleUiSprites();
    },
    scaleSceneSprites: function() {
        const maxWidth = game.world.width - (2 * world.xMargin);
        const tileSize = Math.trunc(maxWidth / world.length);
        const tileScale = tileSize / world.tileSize;
        // this could be simpler but I cbf thinking right now:
        const xOffset = ((maxWidth - (tileSize * world.length)) / 2) + world.xMargin;
        this.sceneGroup.x = xOffset;
        this.sceneGroup.y = game.world.height / 2;
        this.sceneGroup.scale.set(tileScale, tileScale);
    },
    scaleUiSprites: function() {
        let large = 56;
        let small = 40;
        let spacing = 60;
        if(game.world.width < 800) {
            large = 24;
            small = 16;
            spacing = 28;
        }
        else if(game.world.width < 1200) {
            large = 40;
            small = 28;
            spacing = 44;
        }
        this.scoreText.setStyle(textStyle.fg(large));
        this.gameOverText.setStyle(textStyle.fg(large));
        this.highScoreText.setStyle(textStyle.fg(small));
        this.endScoreText.setStyle(textStyle.fg(small));

        var yPos = world.yMargin;
        var xPos = game.world.width / 2;

        util.recentreText(this.gameOverText,  xPos, yPos);
        util.recentreText(this.highScoreText, xPos, yPos + spacing);
        util.recentreText(this.endScoreText,  xPos, yPos + spacing * 2);
        util.recentreText(this.restartButton, xPos, yPos + spacing * 3);
    },
    rescale: function() {
        this.scaleSceneSprites();
        this.scaleUiSprites();
    },
    create: function() {
        /* set up game objects here */
        // Maintain aspect ratio & center    
        //game.scale.forceOrientation(true);
        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.onSizeChange.add(this.rescale, this);

        /* scene sprites */
        game.stage.backgroundColor = colour.bg;
        game.stage.smoothed = false;
        this.createSceneSprites();

        /* ui sprites */
        this.createUiSprites();

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
                bit.position.x = pos * world.tileSize;
            }
            if(!this.gameOver && this.eatTail()) {
                this.gameOver = true;
                this.gameOverText.visible = true;
                this.highScoreText.visible = true;
                this.endScoreText.visible = true;
                this.restartButton.visible = true;

                this.highScoreText.text = "High score: " + this.score;
                this.endScoreText.text = "Your score: " + this.score;
                util.recentreText(this.highScoreText, game.world.width / 2);
                util.recentreText(this.endScoreText, game.world.width / 2);

                //this.gameoverSFX.play();
            }
            else if(this.eatApple()) {
                this.score++;
                this.scoreText.text = "Score: " + this.score;

                snake.grow();
                var pos = (snake.position - snake.length + 1) % world.length;
                var bit = this.snakeBits.create(pos * world.tileSize, world.yOffset, 'snake');

                //this.blopp.play();

                if(snake.length < world.length) {
                    apple.respawn(snake.position, snake.length, world.length);
                    this.appleBit.position.x = apple.position * world.tileSize;
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
