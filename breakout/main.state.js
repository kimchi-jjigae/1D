'use strict';

var game = new Phaser.Game("100%", "100%", Phaser.AUTO, '', null, false, false);

world.length = 40;
world.tileSize = 8;

var MainState = function() {};
MainState.prototype = {
    paddlePosition: 0,
    ballPosition: 19,
    ballVelocity: -0.5,
    blockAmount: 4,

    sceneGroup: undefined,
    paddleSprite: undefined,
    ballSprite:   undefined,
    blockSprites: undefined,

    uiGroup: undefined,
    debugText:       undefined,
    scoreText:       undefined,
    scoreNumberText: undefined,
    gameOverText:    undefined,
    highScoreText:   undefined,
    endScoreText:    undefined,
    restartButton:   undefined,

    score:    0,
    gameOver: false,

    bloppSfx:  undefined,
    pickupSfx: undefined,
    youWinSfx: undefined,

    preload: function() {
        /* load all assets here */
        game.load.image('paddle', getSpritePath('paddle'));
        game.load.image('ball',   getSpritePath('ball'));
        game.load.image('block0', getSpritePath('block0'));
        game.load.image('block1', getSpritePath('block1'));
        game.load.image('block2', getSpritePath('block2'));
        game.load.image('block3', getSpritePath('block3'));
        game.load.image('bgtile', getSpritePath('bgtilehalf'));
        game.load.spritesheet('button', getSpritePath('button-200x60'), 200, 60, 2);

        game.load.audio('blopp',  getSfxPath('move'));
        game.load.audio('pickup', getSfxPath('pickup'));
        game.load.audio('youwin', getSfxPath('youwin'));

        // necessary to preload the font lol
        game.add.text(0, 0, "", textStyle.fg(56));
    },
    restart: function() {
        this.score = 0;
        this.gameOver = false;

        this.paddlePosition = 0;
        this.ballPosition = 19;
        this.ballVelocity = -0.5;
        this.blockAmount = 4;

        this.createSceneSprites();
        this.createUiSprites();
        this.rescale();
    },
    createSceneSprites: function() {
        if(this.sceneGroup) this.sceneGroup.destroy();
        this.sceneGroup = game.add.group();
        if(this.bgTiles) this.bgTiles.destroy();
        this.bgTiles = game.add.group();
        this.blockSprites = game.add.group();
        this.blockSprites.classType = Phaser.Image;

        util.createTileBg(this.bgTiles, world.length, 'bgtile', world.tileSize, 0);
        for(var i = 0; i < this.blockAmount; ++i) {
            var position = (world.length - 1) - i;
            var block = this.blockSprites.create(position * world.tileSize, 0, 'block' + i);
            block.tilePosition = position;
        }
        this.paddleSprite = game.add.sprite(this.paddlePosition * world.tileSize, 0, 'paddle');
        this.ballSprite = game.add.sprite(this.ballPosition * world.tileSize, 0, 'ball');

        this.sceneGroup.addChild(this.bgTiles);
        this.sceneGroup.addChild(this.blockSprites);
        this.sceneGroup.addChild(this.paddleSprite);
        this.sceneGroup.addChild(this.ballSprite);
        this.scaleSceneGroup();
    },
    buttonTextOver: function() {
        // context (this) should refer to the button parent object
        this.children.forEach(function(child) {
            child.setStyle(textStyle.bg(child.style.fontSize));
        });
    },
    buttonTextOut: function() {
        // context (this) should refer to the button parent object
        this.children.forEach(function(child) {
            child.setStyle(textStyle.fg(child.style.fontSize));
        });
    },
    createUiSprites: function() {
        if(this.uiGroup) this.uiGroup.destroy();
        this.uiGroup = game.add.group();

        this.scoreText = game.add.text(world.xMargin, world.yMargin, "Score: ", textStyle.fg(56));
        this.scoreNumberText = game.add.text(world.xMargin + this.scoreText.width, world.yMargin, "0", textStyle.fg(56));
        this.gameOverText = game.add.text(0, 0, "YOU WIN!", textStyle.fg(56));
        this.highScoreText = game.add.text(0, 0, "High score: ", textStyle.fg(32));
        this.endScoreText = game.add.text(0, 0, "Your score: ", textStyle.fg(32));
        this.restartButton = game.add.button(0, 0, 'button', this.restart, this, 1, 0, 1);
        this.restartButton.addChild(game.add.text(12, 15, "PLAY AGAIN", textStyle.fg(30)));
        this.restartButton.onInputOver.add(this.buttonTextOver, this.restartButton);
        this.restartButton.onInputOut.add(this.buttonTextOut, this.restartButton);

        textFlasher.make(this.scoreNumberText, 2);

        this.gameOverText.visible = false;
        this.highScoreText.visible = false;
        this.endScoreText.visible = false;
        this.restartButton.visible = false;

        this.uiGroup.addChild(this.scoreText);
        this.uiGroup.addChild(this.scoreNumberText);
        this.uiGroup.addChild(this.gameOverText);
        this.uiGroup.addChild(this.highScoreText);
        this.uiGroup.addChild(this.endScoreText);
        this.uiGroup.addChild(this.restartButton);
        this.scaleUiGroup();
    },
    scaleSceneGroup: function() {
        // force landscape if on a mobile device
        if(util.deviceInPortraitMode(game)) {
            const maxWidth = game.world.height - (2 * world.xMargin);
            const tileSize = Math.trunc(maxWidth / world.length);
            const tileScale = tileSize / world.tileSize;
            this.sceneGroup.x = game.world.width / 2;
            this.sceneGroup.y = game.world.height - world.xMargin;
            this.sceneGroup.scale.set(tileScale, tileScale);
            this.sceneGroup.angle = -90;
        }
        else {
            const maxWidth = game.world.width - (2 * world.xMargin);
            const tileSize = Math.trunc(maxWidth / world.length);
            const tileScale = tileSize / world.tileSize;
            // this could be simpler but I cbf thinking right now:
            const xOffset = ((maxWidth - (tileSize * world.length)) / 2) + world.xMargin;
            this.sceneGroup.x = xOffset;
            this.sceneGroup.y = game.world.height / 2;
            this.sceneGroup.scale.set(tileScale, tileScale);
            this.sceneGroup.angle = 0;
        }
    },
    scaleUiGroup: function() {
        let large = 56;
        let small = 40;
        let spacing = 60;
        if(util.deviceInPortraitMode(game)) {
            large = 70;
            small = 44;
            spacing = 70;
        }
        else if(game.world.width < 800 && !util.deviceInPortraitMode(game)) {
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
        this.scoreNumberText.setStyle(textStyle.fg(large));
        this.gameOverText.setStyle(textStyle.fg(large));
        this.highScoreText.setStyle(textStyle.fg(small));
        this.endScoreText.setStyle(textStyle.fg(small));

        textFlasher.updateStyleSizes(this.scoreNumberText);

        var yPos = world.yMargin;
        var xPos = game.world.width / 2;

        if(util.deviceInPortraitMode(game)) {
            this.uiGroup.angle = -90;
            this.uiGroup.y = game.world.height - world.xMargin;
            xPos = game.world.height / 2;
            yPos = world.yMargin * 2;
            this.restartButton.scale.set(2, 2);
        }
        else {
            this.uiGroup.angle = 0;
            this.uiGroup.y = 0;
            this.restartButton.scale.set(1, 1);
        }

        util.recentreText(this.gameOverText,  xPos, yPos);
        util.recentreText(this.highScoreText, xPos, yPos + spacing);
        util.recentreText(this.endScoreText,  xPos, yPos + spacing * 2);
        util.recentreText(this.restartButton, xPos, yPos + spacing * 3);
        this.scoreText.y = yPos;
        this.scoreNumberText.x = this.scoreText.width;
        this.scoreNumberText.y = this.scoreText.y;
    },
    rescale: function() {
        this.scaleSceneGroup();
        this.scaleUiGroup();
    },
    create: function() {
        /* set up game objects here */
        game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;
        game.scale.onSizeChange.add(this.rescale, this);

        /* debug */
        this.debugText = game.add.text(0, 0, "dbg", textStyle.fg(18));
        this.debugText.visible = false;

        /* scene sprites */
        game.stage.backgroundColor = colour.bg;
        game.stage.smoothed = false;
        this.createSceneSprites();

        /* ui sprites */
        this.createUiSprites();

        /* sfx */
        this.bloppSfx =  game.add.audio('blopp',  0.5);
        this.pickupSfx = game.add.audio('pickup', 0.3);
        this.youWinSfx = game.add.audio('youwin', 0.2);

        /* input */
        game.input.keyboard.callbackContext = this;
        game.input.keyboard.onDownCallback = function(event) {
            if(keycodes.restart.includes(event.key)) { this.restart() }
        };
    },
    update: function() {
        if(!this.gameOver) {
            this.ballPosition += this.ballVelocity;
            this.ballSprite.position.x = this.ballPosition * world.tileSize;

            if(this.blockSprites.children.length == 0) {
                this.win();
            }
            else if(this.ballPosition <= this.paddlePosition + 1) {
                this.ballVelocity *= -1;
                this.bloppSfx.play();
            }
            else if(this.ballPosition >= this.getLastBlock().tilePosition - 1) {
                this.ballVelocity *= -1;
                this.score++;
                this.scoreNumberText.text = this.score;
                textFlasher.start(this.scoreNumberText);

                if(this.blockSprites.children.length != 1) {
                    this.pickupSfx.play();
                }
                this.getLastBlock().destroy();
            }
            textFlasher.update(this.scoreNumberText);
        }
    },
    win: function() {
        this.gameOver = true;

        this.scoreText.visible =       false;
        this.scoreNumberText.visible = false;
        this.gameOverText.visible =  true;
        this.highScoreText.visible = true;
        this.endScoreText.visible =  true;
        this.restartButton.visible = true;
        this.highScoreText.text = "High score: " + this.score;
        this.endScoreText.text = "Your score: "  + this.score;
        if(util.deviceInPortraitMode(game)) {
            util.recentreText(this.highScoreText, game.world.height / 2);
            util.recentreText(this.endScoreText,  game.world.height / 2);
        }
        else {
            util.recentreText(this.highScoreText, game.world.width / 2);
            util.recentreText(this.endScoreText,  game.world.width / 2);
        }

        this.youWinSfx.play();
    },
    getLastBlock: function() {
        var last = this.blockSprites.children.length - 1;
        return this.blockSprites.children[last];
    }
};

game.state.add('MainState', MainState);
game.state.start('MainState');
