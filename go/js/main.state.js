'use strict';
var debug = true;
var dprint = function(text) {
    if(debug) console.log(text);
};

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
    capturedScore: [0, 0],
    areaScore: [0, 0],
    totalScore: [0, 0],
    placedStones: new Array(19), // hmm
    permittedPlacements: new Array(19),
    previouslyCaptured: [],
    previousPlacement: 0,

    boardPos: [0, 420],
    placementPositions: new Array(19),
    hoverBlackSprite: undefined,
    hoverWhiteSprite: undefined,
    spriteScale: 4.8,

    stateText: undefined,
    blackScoreTitle: undefined,
    whiteScoreTitle: undefined,
    capturedTitleText: undefined,
    capturedBlackText: undefined,
    capturedWhiteText: undefined,
    captureScoreBlackText: undefined,
    captureScoreWhiteText: undefined,
    areaScoreBlackText: undefined,
    areaScoreWhiteText: undefined,
    totalScoreBlackText: undefined,
    totalScoreWhiteText: undefined,
    komiScoreWhiteText: undefined,

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
        this.blackScoreTitle = game.add.text(xPos, 220, "Black", {font: '56px nokiafc', fill: '#ffffff'});
        this.whiteScoreTitle = game.add.text(winsize[0] - xPos, 220, "White", {font: '56px nokiafc', fill: '#ffffff'});
        this.captureScoreBlackText = game.add.text(xPos, 560, "Capture score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.captureScoreWhiteText = game.add.text(winsize[0] - xPos, 560, "Capture score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.areaScoreBlackText = game.add.text(xPos, 630, "Area score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.areaScoreWhiteText = game.add.text(winsize[0] - xPos, 630, "Area score: 0", {font: '48px nokiafc', fill: '#ffffff'});
        this.totalScoreBlackText = game.add.text(xPos, 710, "Total score: 0", {font: '56px nokiafc', fill: '#ffffff'});
        this.totalScoreWhiteText = game.add.text(winsize[0] - xPos, 710, "Total score: 0", {font: '56px nokiafc', fill: '#ffffff'});
        this.komiScoreWhiteText = game.add.text(winsize[0] - xPos, 370, "Komi score: 0.5", {font: '48px nokiafc', fill: '#ffffff'});

        util.recentreText(this.stateText);
        util.recentreText(this.blackScoreTitle);
        util.recentreText(this.whiteScoreTitle);
        util.recentreText(this.captureScoreBlackText);
        util.recentreText(this.captureScoreWhiteText);
        util.recentreText(this.areaScoreBlackText);
        util.recentreText(this.areaScoreWhiteText);
        util.recentreText(this.totalScoreBlackText);
        util.recentreText(this.totalScoreWhiteText);
        util.recentreText(this.komiScoreWhiteText);

        this.stateText.visible = false;
        this.capturedTitleText.visible = false;
        this.capturedBlackText.visible = false;
        this.capturedWhiteText.visible = false;
        this.capturedBlackSprite.visible = false;
        this.capturedWhiteSprite.visible = false;
        this.hoverBlackSprite.visible = false;
        this.hoverWhiteSprite.visible = false;
        this.blackScoreTitle.visible = false;
        this.whiteScoreTitle.visible = false;
        this.captureScoreBlackText.visible = false;
        this.captureScoreWhiteText.visible = false;
        this.areaScoreBlackText.visible = false;
        this.areaScoreWhiteText.visible = false;
        this.totalScoreBlackText.visible = false;
        this.totalScoreWhiteText.visible = false;
        this.komiScoreWhiteText.visible = false;
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
        if(++k.consecutivePasses == 2) {
            k.gameOver = true;
            this.endGame();
        }
        else {
            k.currentPlayer = !k.currentPlayer;
            k.previousPlacement = undefined;
            let colour = k.currentPlayer == 0 ? 'Black' : 'White';
            k.stateText.text = colour + " to move";
        }
    },
    endGame: function() {
        k.capturedTitleText.visible = false;
        k.capturedBlackText.visible = false;
        k.capturedWhiteText.visible = false;
        k.capturedBlackSprite.visible = false;
        k.capturedWhiteSprite.visible = false;
        this.buttonPass.visible = false;
        k.hoverBlackSprite.visible = false;
        k.hoverWhiteSprite.visible = false;

        k.blackScoreTitle.visible = true;
        k.whiteScoreTitle.visible = true;
        k.captureScoreBlackText.visible = true;
        k.captureScoreWhiteText.visible = true;
        k.areaScoreBlackText.visible = true;
        k.areaScoreWhiteText.visible = true;
        k.totalScoreBlackText.visible = true;
        k.totalScoreWhiteText.visible = true;
        k.komiScoreWhiteText.visible = true;

        this.calculateDeadStones();
        this.calculateAreaScores();
        k.totalScore[0] = k.capturedScore[0] + k.areaScore[0];
        k.totalScore[1] = k.capturedScore[1] + k.areaScore[1] + 0.5; // komi

        k.captureScoreBlackText.text = "Capture score: " + k.capturedScore[0];
        k.captureScoreWhiteText.text = "Capture score: " + k.capturedScore[1];
        k.areaScoreBlackText.text = "Area score: " + k.areaScore[0];
        k.areaScoreWhiteText.text = "Area score: " + k.areaScore[1];
        k.totalScoreBlackText.text = "Total score: " + k.totalScore[0];
        k.totalScoreWhiteText.text = "Total score: " + k.totalScore[1];
        let winner = k.totalScore[0] > k.totalScore[1] ? "black" : "white";
        k.stateText.text = "Congratulations, " + winner + "! You win!";
        k.stateText.x = winsize[0] / 2;
        k.stateText.y = 80;
        util.recentreText(k.stateText);
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
        if(k.gameOver) {
        }
        else if(k.placingStone) {
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
        else {
            this.startGame();
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
    checkCaptures: function(position, colour, anticolour) {
        let directions = [-1, 1];
        let captured = [[], []];
        directions.forEach((dir, i) => {
            let maybeCaptured = [];
            let hoj = position + dir;
            while(k.placedStones[hoj] != undefined && k.placedStones[hoj].key == anticolour) {
                maybeCaptured.push(hoj);
                hoj += dir;
            }
            if(maybeCaptured.length > 0) {
                let sameColour = k.placedStones[hoj] != undefined && k.placedStones[hoj].key == colour;
                if(hoj == -1 || hoj == 19 || sameColour) {
                    captured[i] = maybeCaptured;
                }
            }
        });
        return captured;
    },
    handleMouseUp: function() {
        if(k.hoveringStone) {
            // add sprite
            let hej = this.closestPos();
            let colour = k.currentPlayer == 0 ? 'black' : 'white';
            let pos = k.placementPositions[hej];
            let newStone = game.add.sprite(pos[0], pos[1], colour);
            newStone.scale.set(k.spriteScale, k.spriteScale);
            k.placedStones[hej] = newStone;

            // check for captures
            let anticolour = k.currentPlayer == 0 ? 'white' : 'black';
            let captures = this.checkCaptures(hej, colour, anticolour);
            k.previouslyCaptured = [];
            k.previouslyCaptured.push(...captures[0]);
            k.previouslyCaptured.push(...captures[1]);
            for(let i of k.previouslyCaptured) {
                k.placedStones[i].destroy();
                k.placedStones[i] = undefined;
            }
            
            k.capturedScore[k.currentPlayer] += k.previouslyCaptured.length;

            dprint("updating permitted placements");
            // updated permitted placements
            k.permittedPlacements.forEach((value, i) => {
                dprint(i);
                let permitted = true;
                if(k.placedStones[i] != undefined) {
                    // may not place where stones exist
                    dprint("blocked");
                    permitted = false;
                }
                else {
                    // suicide prevention
                    let surrounded = [0, 0]; // 0
                    let anticolour = k.currentPlayer == 0 ? 'white' : 'black';
                    let directions = [-1, 1];
                    directions.forEach((dir, j) => {
                        let hoj = i + dir;
                        while(k.placedStones[hoj] != undefined && k.placedStones[hoj].key == anticolour) {
                            // skip over the stones of the next player's colour
                            hoj += dir;
                        }
                        if(k.placedStones[hoj] == undefined) {
                            if(hoj == -1 || hoj == 19) {
                                // an edge is equivalent to an enemy stone
                                surrounded[j] = true;
                            }
                            else {
                                surrounded[j] = false;
                            }
                        }
                        else if(k.placedStones[hoj].key == colour) {
                            surrounded[j] = true;
                        }
                    });
                    if(surrounded[0] && surrounded[1]) {
                        permitted = false;
                        dprint("suicide-prevented");
                    }

                    // but if possible to capture, then ignore suicide rule, unless ko
                    let captures = this.checkCaptures(i, anticolour, colour);
                    for(let capture of captures) {
                        // ko if:
                        // exactly one stone captured in the previous move
                        // the placed stone is at this position
                        // the placed stone will capture exactly one stone
                        // which hapens to be the stone previously used for capturing!
                        if(k.previouslyCaptured.length == 1 && k.previouslyCaptured[0] == i
                            && capture.length == 1 && capture[0] == hej) {
                            dprint("capture but it's ko");
                            permitted = false;
                            break;
                        }
                        else if(capture.length > 0) {
                            dprint("capture but not ko");
                            permitted = true;
                        }
                    }
                }
                k.permittedPlacements[i] = permitted;
            });

            // update other stuff
            k.consecutivePasses = 0;
            k.currentPlayer = k.currentPlayer == 0 ? 1 : 0;
            k.previousPlacement = hej;
            colour = k.currentPlayer == 0 ? 'Black' : 'White';
            k.stateText.text = colour + " to move";
            k.capturedBlackText.text = "x " + k.capturedScore[1];
            k.capturedWhiteText.text = "x " + k.capturedScore[0];
        }
    },
    calculateDeadStones: function() {
    },
    calculateAreaScores: function() {
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
