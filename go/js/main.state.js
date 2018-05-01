'use strict';

var winsize = [1366, 768]
var game = new Phaser.Game(winsize[0], winsize[1], Phaser.AUTO, '', null, false, false);

var K = function() {};
K.prototype = {
    placingStone: false,
    gameStarted: false,
    gameOver: false,
    consecutivePasses: 0, 

    aiOn: false,
    aiPlayer: 0,

    currentPlayer: 0, // 0 black, 1 white
    capturedPieces: [0, 0],
    areaScore: [0, 0],
    totalScore: [0, 0],
    placedStones: new Array(19), // hmm
    permittedPlacements: new Array(19),
    previouslyCapturedStones: [],
    previousPlacement: 0,

    boardPosition: [0, 0],
    placementPositions: new Array(19),
    cursorDistanceThreshold: 20,
    spriteScale: 4.8,

    stateText: undefined,
    capturedTitleText: undefined,
    capturedBlackText: undefined,
    capturedWhiteText: undefined,
    captureScoreBlackText: undefined,
    captureScoreWhiteText: undefined,
    areaScoreBlackText: undefined,
    areaScoreWhiteText: undefined,
    totalScoreBlackText: undefined,
    totalScoreWhiteText: undefined,

    capturedBlackSprite: undefined,
    capturedWhiteSprite: undefined,

    buttonPvP: undefined,
    buttonAI: undefined,
    buttonPass: undefined,
    /*
    this.button1 = game.add.button(481, 200, 'button1', this.startGame, this, 1, 0, 1);
    this.button2 = game.add.button(685, 200, 'button2', this.startGame, this, 1, 0, 1);
    this.button1 = game.add.button(481, 200, 'button1', this.startGame, this, 1, 0, 1);
    */
    init: function() {
        for(var i = 0; i < 19; ++i) {
            this.placementPositions[i] = [
                this.boardPosition[0] + i * 64,
                this.boardPosition[1]
            ]
        }
        this.stateText = game.add.text(winsize[0] / 2, 80, "Black to move", {font: '56px nokiafc', fill: '#ffffff'});
        this.capturedTitleText = game.add.text(30, 550, "Captured pieces:", {font: '56px nokiafc', fill: '#ffffff'});
        this.capturedBlackText = game.add.text(130, 620, "x 0", {font: '56px nokiafc', fill: '#ffffff'});
        this.capturedWhiteText = game.add.text(130, 690, "x 0", {font: '56px nokiafc', fill: '#ffffff'});
        this.capturedBlackSprite = game.add.sprite(40, 615, 'black');
        this.capturedWhiteSprite = game.add.sprite(40, 685, 'white');
        this.capturedBlackSprite.scale.set(k.spriteScale, k.spriteScale);
        this.capturedWhiteSprite.scale.set(k.spriteScale, k.spriteScale);

        /*
        let xPos = 320;
        this.captureScoreBlackText = game.add.text(xPos, 560, "Capture score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.captureScoreWhiteText = game.add.text(winsize[0] - xPos, 560, "Capture score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.areaScoreBlackText = game.add.text(xPos, 630, "Area score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.areaScoreWhiteText = game.add.text(winsize[0] - xPos, 630, "Area score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.totalScoreBlackText = game.add.text(xPos, 710, "Total score: 0", {font: '56px nokiafc', fill: '#ffffff'});
        this.totalScoreWhiteText = game.add.text(winsize[0] - xPos, 710, "Total score: 0", {font: '56px nokiafc', fill: '#ffffff'});

        util.recentreText(this.captureScoreBlackText);
        util.recentreText(this.captureScoreWhiteText);
        util.recentreText(this.areaScoreBlackText);
        util.recentreText(this.areaScoreWhiteText);
        util.recentreText(this.totalScoreBlackText);
        util.recentreText(this.totalScoreWhiteText);
        */
        util.recentreText(this.stateText);
    },
};

var k = new K();

var MainState = function() {};
MainState.prototype = {
    startGame: function() {
        /*
        k.button1.visible = false;
        k.button2.visible = false;
        k.buttonPass.visible = true;

        this.ballSprite.visible = true;
        if(util.randomBool()) {
            this.ballVelocity *= -1;
        }

        this.started = true;
        */
    },
    preload: function() {
        game.load.image('black', 'assets/sprites/black.png');
        game.load.image('white', 'assets/sprites/white.png');
        game.load.image('black_hover', 'assets/sprites/black_hover.png');
        game.load.image('white_hover', 'assets/sprites/white_hover.png');
        game.load.image('bg', 'assets/sprites/bg.png');

        game.load.spritesheet('button1', 'assets/sprites/button1.png', 200, 60, 2);
        game.load.spritesheet('button2', 'assets/sprites/button2.png', 200, 60, 2);
        game.load.spritesheet('buttonPass', 'assets/sprites/button2.png', 200, 60, 2);

	    game.load.script('utilScript', '../js/util.js');
        game.add.text(0, 0, "", {font: '56px nokiafc', fill: '#ffffff'});
    },
    create: function() {
        var bg = game.add.sprite(0, 420, 'bg');
        bg.scale.set(k.spriteScale, k.spriteScale);
        game.stage.backgroundColor = "#333333";
        //game.stage.backgroundColor = "#789789";
        game.scale.pageAlignHorizontally = true; game.scale.pageAlignVertically = true;

        game.stage.smoothed = false;
        k.init();
    },
    update: function() {
    },
    eatTail: function() {
    }
};

game.state.add('MainState', MainState);
game.state.start('MainState');
