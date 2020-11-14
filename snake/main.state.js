'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

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
    worldLength: 20,
    tileSize: 64,
    xOffset: 43,
    yPosition: (768 / 2) - 32,
    tickRate: 300,
    lastTicked: Date.now(),
    snakeBits: undefined,
    appleBit: undefined,
    scoreText: undefined,
    score: 0,
    gameOver: false,
    blopp: undefined,
    gameoverSFX: undefined,
    preload: function() {
        game.load.image('head',  getSpritePath('snakehead'));
        game.load.image('snake', getSpritePath('snake'));
        game.load.image('apple', getSpritePath('apple'));
        game.load.image('bg',    getSpritePath('bg'));

        game.load.audio('blopp',    getSfxPath('blopp1'));
        game.load.audio('gameover', getSfxPath('gameover'));

        this.snakeBits = game.add.group();

	    game.load.script('utilScript', getScriptPath('util'));
	    game.load.script('directionEnumScript', getScriptPath('direction.enum'));
	    game.load.script('keycodesScript',      getScriptPath('keycodes'));
        game.add.text(0, 0, "", textStyle.large);
    },
    create: function() {
        game.add.sprite(0, 0, 'bg');
        game.stage.backgroundColor = colour.bg;
        game.scale.pageAlignHorizontally = true;  game.scale.pageAlignVertically = true;
        var tileScale = this.tileSize / 16;

        this.blopp = game.add.audio('blopp');
        this.gameoverSFX = game.add.audio('gameover');

        var bit = this.snakeBits.create((snake.position) * this.tileSize + this.xOffset, this.yPosition, 'head');
        bit.scale.set(tileScale, tileScale);
        for(var i = 1; i < snake.length; ++i) {
            bit = this.snakeBits.create((snake.position - i) * this.tileSize + this.xOffset, this.yPosition, 'snake');
            bit.scale.set(tileScale, tileScale);
        }
        this.appleBit = game.add.sprite(apple.position * this.tileSize + this.xOffset, this.yPosition, 'apple');
        this.appleBit.scale.set(tileScale, tileScale);

        var self = this;
        game.input.keyboard.onDownCallback = function(event) {
            if(keycodes.right.includes(event.key)) {
                // → right
                self.lastTicked = 0;
            }
            else if(keycodes.restart.includes(event.key)) {
                // R restart
                apple.reset();
                snake.reset();
                self.score = 0;
                self.gameOver = false;
                self.scoreText.text = "Score: " + self.score;
                self.scoreText.visible = true;
                game.stage.backgroundColor = colour.bg;
                game.state.start('MainState');
            }
        };
        this.scoreText = game.add.text(0, 0, "Score: 0", textStyle.large);
        game.stage.smoothed = false;
    },
    update: function() {
        if(this.timeToTick() && !this.gameOver) {
            snake.position++;
            for(var i = 0; i < this.snakeBits.length; ++i) {
                var bit = this.snakeBits.children[i];
                var pos = (snake.position - i) % this.worldLength;
                bit.position.x = pos * this.tileSize + this.xOffset;
            }
            if(this.eatTail()) {
                var yPos = 150;
                this.scoreText.visible = false;
                var gameOverText = game.add.text(game.world.width / 2, yPos, "GAME OVER", textStyle.large);
                var highScoreText = game.add.text(game.world.width / 2, yPos + 80, "High score: " + this.score, textStyle.medium);
                var scoreText = game.add.text(game.world.width / 2, yPos + 160, "Your score: " + this.score, textStyle.medium);
                util.recentreText(gameOverText);
                util.recentreText(scoreText);
                util.recentreText(highScoreText);
                this.gameoverSFX.play();
                this.gameOver = true;
            }
            else if(this.eatApple()) {
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
        return (snake.position % this.worldLength) == apple.position
    },
    eatTail: function() {
        var head = snake.position % this.worldLength;
        var tail = (snake.position - snake.length) % this.worldLength;
        return head == tail;
    }
};

game.state.add('MainState', MainState);
game.state.start('MainState');