'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var MainState = function() {};
MainState.prototype = {
    worldLength: 40,
    tileSize: 32,
    xOffset: 43,
    yPosition: (768 / 2) - 32,

    paddlePosition: 0,
    ballPosition: 19,
    ballVelocity: -0.5,
    blockAmount: 4,

    paddleSprite: undefined,
    ballSprite:   undefined,
    blockSprites: undefined,

    scoreText: undefined,
    score: 0,
    gameOver: false,

    blopp1SFX: undefined,
    blopp2SFX: undefined,
    gameoverSFX: undefined,

    preload: function() {
        game.load.image('paddle', 'assets/sprites/paddle.png');
        game.load.image('ball',   'assets/sprites/ball.png');
        game.load.image('block0', 'assets/sprites/block1.png');
        game.load.image('block1', 'assets/sprites/block2.png');
        game.load.image('block2', 'assets/sprites/block3.png');
        game.load.image('block3', 'assets/sprites/block4.png');
        game.load.image('bg',     'assets/sprites/bg.png');

        game.load.audio('blopp1', 'assets/sfx/blopp1.wav');
        game.load.audio('blopp2', 'assets/sfx/blopp2.wav');
        game.load.audio('gameover', 'assets/sfx/gameover.wav');

        this.blockSprites = game.add.group();

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

        this.blopp1SFX = game.add.audio('blopp1');
        this.blopp2SFX = game.add.audio('blopp2');
        this.gameoverSFX = game.add.audio('gameover');

        this.paddleSprite = game.add.sprite(this.paddlePosition * this.tileSize + this.xOffset, this.yPosition, 'paddle');
        this.paddleSprite.scale.set(tileScale, tileScale);

        this.ballSprite = game.add.sprite(this.ballPosition * this.tileSize + this.xOffset, this.yPosition, 'ball');
        this.ballSprite.scale.set(tileScale, tileScale);

        for(var i = 0; i < this.blockAmount; ++i) {
            var position = (this.worldLength - 1) - i;
            var block = this.blockSprites.create(position * this.tileSize + this.xOffset, this.yPosition, 'block' + i);
            block.scale.set(tileScale, tileScale);
            block.tilePosition = position;
        }

        var self = this;
        game.input.keyboard.onDownCallback = function(event) {
            if(keycodes.restart.includes(event.key)) {
                // R restart
                self.ballPosition = 19;
                self.ballVelocity = -0.5;
                self.score = 0;
                self.scoreText.text = "Score: " + self.score;
                self.scoreText.visible = true;
                self.gameOver = false;
                game.stage.backgroundColor = "#FFFFFF";
                game.state.start('MainState');
            }
        };
        this.scoreText = game.add.text(this.xOffset, 0, "Score: 0", {font: '56px pixelbug', fill: '#ffffff'});
    },
    update: function() {
        if(!this.gameOver) {
            this.ballPosition += this.ballVelocity;
            this.ballSprite.position.x = this.ballPosition * this.tileSize + this.xOffset;

            if(this.blockSprites.children.length == 0) {
                var yPos = 150;
                this.scoreText.visible = false;
                var gameOverText = game.add.text(game.world.width / 2, yPos, "YOU WIN!", {font: '56px pixelbug', fill: '#ffffff'});
                var highScoreText = game.add.text(game.world.width / 2, yPos + 80, "High score: " + this.score, {font: '48px pixelbug', fill: '#ffffff'});
                var scoreText = game.add.text(game.world.width / 2, yPos + 160, "Your score: " + this.score, {font: '48px pixelbug', fill: '#ffffff'});
                util.recentreText(gameOverText);
                util.recentreText(scoreText);
                util.recentreText(highScoreText);
                this.gameOver = true;
                this.gameoverSFX.play();
            }
            else if(this.ballPosition <= this.paddlePosition + 1) {
                this.ballVelocity *= -1;
                this.blopp1SFX.play();
            }
            else if(this.ballPosition >= this.getLastBlock().tilePosition - 1) {
                this.ballVelocity *= -1;
                this.score++;
                this.scoreText.text = "Score: " + this.score;
                this.blopp2SFX.play();

                this.getLastBlock().destroy();
            }
        }
    },
    getLastBlock: function() {
        var last = this.blockSprites.children.length - 1;
        return this.blockSprites.children[last];
    }
};

game.state.add('MainState', MainState);
game.state.start('MainState');
