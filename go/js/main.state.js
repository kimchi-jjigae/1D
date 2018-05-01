'use strict';

var winsize = [1366, 768]
var game = new Phaser.Game(winsize[0], winsize[1], Phaser.AUTO, '', null, false, false);

var K = function() {};
K.prototype = {
    placingStone: false,
    hoveringStone: false,
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

    boardPos: [0, 420],
    placementPositions: new Array(19),
    hoverBlackSprite: undefined,
    hoverWhiteSprite: undefined,
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

    init: function() {
        for(let i = 0; i < 19; ++i) {
            this.placementPositions[i] = [
                this.boardPos[0] + i * 15 * this.spriteScale,
                this.boardPos[1]
            ];
            this.permittedPlacements[i] = true;
        }
        // gameplay
        this.stateText = game.add.text(winsize[0] / 2, 80, "Black to move", {font: '56px nokiafc', fill: '#ffffff'});
        this.capturedTitleText = game.add.text(30, 550, "Captured pieces:", {font: '56px nokiafc', fill: '#ffffff'});
        this.capturedBlackText = game.add.text(130, 620, "x 0", {font: '56px nokiafc', fill: '#ffffff'});
        this.capturedWhiteText = game.add.text(130, 690, "x 0", {font: '56px nokiafc', fill: '#ffffff'});
        this.capturedBlackSprite = game.add.sprite(40, 615, 'black');
        this.capturedWhiteSprite = game.add.sprite(40, 685, 'white');
        this.hoverBlackSprite = game.add.sprite(0, 0, 'black_hover');
        this.hoverWhiteSprite = game.add.sprite(0, 0, 'white_hover');
        this.capturedBlackSprite.scale.set(k.spriteScale, k.spriteScale);
        this.capturedWhiteSprite.scale.set(k.spriteScale, k.spriteScale);
        this.hoverBlackSprite.scale.set(k.spriteScale, k.spriteScale);
        this.hoverWhiteSprite.scale.set(k.spriteScale, k.spriteScale);

        let xPos = 320;
        // endgame
        this.captureScoreBlackText = game.add.text(xPos, 560, "Capture score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.captureScoreWhiteText = game.add.text(winsize[0] - xPos, 560, "Capture score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.areaScoreBlackText = game.add.text(xPos, 630, "Area score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.areaScoreWhiteText = game.add.text(winsize[0] - xPos, 630, "Area score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.totalScoreBlackText = game.add.text(xPos, 710, "Total score: 0", {font: '56px nokiafc', fill: '#ffffff'});
        this.totalScoreWhiteText = game.add.text(winsize[0] - xPos, 710, "Total score: 0", {font: '56px nokiafc', fill: '#ffffff'});

        util.recentreText(this.stateText);
        util.recentreText(this.captureScoreBlackText);
        util.recentreText(this.captureScoreWhiteText);
        util.recentreText(this.areaScoreBlackText);
        util.recentreText(this.areaScoreWhiteText);
        util.recentreText(this.totalScoreBlackText);
        util.recentreText(this.totalScoreWhiteText);

        this.stateText.visible = false;
        this.capturedTitleText.visible = false;
        this.capturedBlackText.visible = false;
        this.capturedWhiteText.visible = false;
        this.capturedBlackSprite.visible = false;
        this.capturedWhiteSprite.visible = false;
        this.hoverBlackSprite.visible = false;
        this.hoverWhiteSprite.visible = false;
        this.captureScoreBlackText.visible = false;
        this.captureScoreWhiteText.visible = false;
        this.areaScoreBlackText.visible = false;
        this.areaScoreWhiteText.visible = false;
        this.totalScoreBlackText.visible = false;
        this.totalScoreWhiteText.visible = false;
    },
};

var k = new K();

var MainState = function() {};
MainState.prototype = {
    // buttons here to access functions lol
    buttonPvP: undefined, 
    buttonAI: undefined,
    buttonPass: undefined,
    startGame: function() {
        this.buttonPvP.visible = false;
        this.buttonAI.visible = false;

        k.stateText.visible = true;
        k.capturedTitleText.visible = true;
        k.capturedBlackText.visible = true;
        k.capturedWhiteText.visible = true;
        k.capturedBlackSprite.visible = true;
        k.capturedWhiteSprite.visible = true;
        this.buttonPass.visible = true;

        k.placingStone = true;
    },
    pass: function() {
        k.consecutivePasses++;
    },
    endGame: function() {
        this.buttonPvP.visible = false;
        this.buttonAI.visible = false;

        k.stateText.visible = true;
        k.capturedTitleText.visible = true;
        k.capturedBlackText.visible = true;
        k.capturedWhiteText.visible = true;
        k.capturedBlackSprite.visible = true;
        k.capturedWhiteSprite.visible = true;
        this.buttonPass.visible = true;
    },
    preload: function() {
        game.load.image('black', 'assets/sprites/black.png');
        game.load.image('white', 'assets/sprites/white.png');
        game.load.image('black_hover', 'assets/sprites/black_hover.png');
        game.load.image('white_hover', 'assets/sprites/white_hover.png');
        game.load.image('bg', 'assets/sprites/bg.png');

        game.load.spritesheet('buttonPvP', 'assets/sprites/buttonpvp.png', 200, 60, 2);
        game.load.spritesheet('buttonAI', 'assets/sprites/buttonai.png', 200, 60, 2);
        game.load.spritesheet('buttonPass', 'assets/sprites/buttonpass.png', 200, 60, 2);

	    game.load.script('utilScript', '../js/util.js');
        game.add.text(0, 0, "", {font: '56px nokiafc', fill: '#ffffff'});
    },
    create: function() {
        var bg = game.add.sprite(k.boardPos[0], k.boardPos[1], 'bg');
        bg.scale.set(k.spriteScale, k.spriteScale);
        game.stage.backgroundColor = "#333333";
        game.scale.pageAlignHorizontally = true; game.scale.pageAlignVertically = true;
        game.stage.smoothed = false;
        game.input.mouse.mouseUpCallback = () => this.handleMouseUp(); // arrow function for correct `this`

        this.buttonAI = game.add.button(685, 200, 'buttonAI', this.startGame, this, 1, 0, 1);
        this.buttonPvP = game.add.button(481, 200, 'buttonPvP', this.startGame, this, 1, 0, 1);

        this.buttonPass = game.add.button(winsize[0] / 2 - 100, 200, 'buttonPass', this.pass, this, 1, 0, 1);
        this.buttonPass.visible = false;
        k.init();
    },
    update: function() {
        if(k.placingStone) {
            if(this.atPermittedPlacement()) {
                k.hoveringStone = true;
                let i = this.closestPos();
                if(k.currentPlayer == 0) {
                    k.hoverBlackSprite.visible = true;
                    k.hoverBlackSprite.x = k.placementPositions[i][0];
                    k.hoverBlackSprite.y = k.placementPositions[i][1];
                }
                else {
                    k.hoverWhiteSprite.visible = true;
                    k.hoverWhiteSprite.x = k.placementPositions[i][0];
                    k.hoverWhiteSprite.y = k.placementPositions[i][1];
                }
            }
            else {
                k.hoveringStone = false;
                k.hoverBlackSprite.visible = false;
                k.hoverWhiteSprite.visible = false;
            }
        }
        else if(k.gameOver) {
        }
    },
    closestPos: function() {
        return Math.floor(game.input.mousePointer.x / (winsize[0]/19));
    },
    atPermittedPlacement: function() {
        let mouseY = game.input.mousePointer.y;
        if(mouseY > k.boardPos[1] && mouseY < k.boardPos[1] + 72) {
            if(k.permittedPlacements[this.closestPos()] === true) {
                return true;
            }
        }
        return false;
    },
    handleMouseUp: function() {
        if(k.hoveringStone) {
            // add sprite
            let i = this.closestPos();
            let colour = k.currentPlayer == 0 ? 'black' : 'white';
            let pos = k.placementPositions[i];
            let newStone = game.add.sprite(pos[0], pos[1], colour);
            newStone.scale.set(k.spriteScale, k.spriteScale);
            k.placedStones[i] = newStone;

            // check for captures
            // updated permitted placements
                // check for ko
            /*
            // update other stuff
    capturedPieces: [0, 0],
    permittedPlacements: new Array(19),
    previouslyCapturedStones: [],
    */
            k.consecutivePasses = 0;
            k.currentPlayer = !k.currentPlayer;
            k.previousPlacement = i;
            colour = k.currentPlayer == 0 ? 'Black' : 'White';
            k.stateText.text = colour + " to move";
        }
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
