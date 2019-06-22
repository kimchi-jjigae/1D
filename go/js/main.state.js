'use strict';
var debug = false;
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
    aiThinkingTime: 0,
    aiChosen: false,
    aiPlacement: 0,
    aiPlacingTime: 800, // milliseconds

    currentPlayer: 0, // 0 black, 1 white
    capturedScore: [0, 0],
    areaScore: [0, 0],
    totalScore: [0, 0],
    placedSprites: new Array(19),
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
        this.totalScoreWhiteText = game.add.text(winsize[0] - xPos - 10, 710, "Total score: 0", {font: '56px nokiafc', fill: '#ffffff'});
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
    startAiGame: function() {
        k.aiOn = true;
        k.aiPlayer = util.randomInt(2);
        dprint("AI set to player " + k.aiPlayer);
        if(k.aiPlayer == 0) {
            k.stateText.text = "Black (AI) to move";
            this.buttonPass.visible = false;
        }
        this.startGame();
    },
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

        this.resetAiThoughts();
    },
    resetAiThoughts: function() {
        if(k.aiOn && k.currentPlayer == k.aiPlayer) {
            let thinkTime = util.randomFloat(500, 2000);
            k.aiThinkingTime = Date.now() + thinkTime;
            k.aiChosen = false;
            dprint("AI thinking for " + thinkTime + " ms");
        }
    },
    pass: function() {
        if(++k.consecutivePasses == 2) {
            k.gameOver = true;
            this.endGame();
        }
        else {
            this.changeTurn(undefined);
        }
    },
    changeTurn: function(previousPlacement) {
        this.hideHoverSprite();
        this.updatePermittedPlacements(previousPlacement);
        k.currentPlayer = k.currentPlayer == 0 ? 1 : 0;
        k.previousPlacement = previousPlacement;
        let colour = k.currentPlayer == 0 ? 'Black' : 'White';
        if(k.aiOn && k.currentPlayer == k.aiPlayer) {
            k.stateText.text = colour + " (AI) to move";
            this.buttonPass.visible = false;
        }
        else {
            k.stateText.text = colour + " to move";
            this.buttonPass.visible = true;
        }
        k.capturedBlackText.text = "x " + k.capturedScore[1];
        k.capturedWhiteText.text = "x " + k.capturedScore[0];
        this.resetAiThoughts();
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
        if(k.totalScore[1] > 9.5) {
            k.totalScoreWhiteText.x = winsize[0] - 320;
            k.totalScoreWhiteText.y = 710;
            util.recentreText(k.totalScoreWhiteText);
        }
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
        game.stage.backgroundColor = "#000000";
        game.scale.pageAlignHorizontally = true; game.scale.pageAlignVertically = true;
        game.stage.smoothed = false;
        game.input.mouse.mouseUpCallback = () => this.handleMouseUp(); // arrow function for correct `this`

        this.buttonAI = game.add.button(685, 200, 'buttonAI', this.startAiGame, this, 1, 0, 1);
        this.buttonPvP = game.add.button(481, 200, 'buttonPvP', this.startGame, this, 1, 0, 1);

        this.buttonPass = game.add.button(winsize[0] / 2 - 100, 200, 'buttonPass', this.pass, this, 1, 0, 1);
        this.buttonPass.visible = false;
        k.init();
    },
    hoverSprite: function(position) {
        if(k.currentPlayer == 0) {
            k.hoverBlackSprite.visible = true;
            k.hoverBlackSprite.x = k.placementPositions[position][0];
            k.hoverBlackSprite.y = k.placementPositions[position][1];
        }
        else {
            k.hoverWhiteSprite.visible = true;
            k.hoverWhiteSprite.x = k.placementPositions[position][0];
            k.hoverWhiteSprite.y = k.placementPositions[position][1];
        }
    },
    hideHoverSprite: function() {
        k.hoveringStone = false;
        k.hoverBlackSprite.visible = false;
        k.hoverWhiteSprite.visible = false;
    },
    chooseAiPlacement: function() {
        let placements = [];
        k.permittedPlacements.forEach((permitted, i) => {
            if(permitted) {
                placements.push(i);
            }
        });
        if(placements.length > 0) {
            let i = util.randomInt(placements.length);
            return placements[i];
        }
        else {
            return undefined;
        }
    },
    update: function() {
        if(k.gameOver) {
        }
        else if(k.placingStone) {
            if(k.aiOn && k.currentPlayer == k.aiPlayer) {
                if(Date.now() > k.aiThinkingTime + k.aiPlacingTime) {
                    let blåbär = k.aiPlacement;
                    this.addNewSprite(blåbär);
                    this.captureStones(blåbär);
                    this.changeTurn(blåbär);
                }
                else if(Date.now() > k.aiThinkingTime) {
                    if(!k.aiChosen) {
                        let placement = this.chooseAiPlacement();
                        if(placement != undefined) {
                            k.aiPlacement = placement;
                            this.hoverSprite(placement);
                            k.aiChosen = true;
                        }
                        else {
                            this.pass();
                        }
                    }
                }
            }
            else if(this.atPermittedPlacement()) {
                k.hoveringStone = true;
                let i = this.closestPos();
                this.hoverSprite(i);
            }
            else {
                this.hideHoverSprite();
            }
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
            while(k.placedSprites[hoj] != undefined && k.placedSprites[hoj].key == anticolour) {
                maybeCaptured.push(hoj);
                hoj += dir;
            }
            if(maybeCaptured.length > 0) {
                let sameColour = k.placedSprites[hoj] != undefined && k.placedSprites[hoj].key == colour;
                if(hoj == -1 || hoj == 19 || sameColour) {
                    captured[i] = maybeCaptured;
                }
            }
        });
        return captured;
    },
    addNewSprite: function(position) {
        let colour = k.currentPlayer == 0 ? 'black' : 'white';
        let pos = k.placementPositions[position];
        let newStone = game.add.sprite(pos[0], pos[1], colour);
        newStone.scale.set(k.spriteScale, k.spriteScale);
        k.placedSprites[position] = newStone;
    },
    captureStones: function(position) {
        let colour = k.currentPlayer == 0 ? 'black' : 'white';
        let anticolour = k.currentPlayer == 0 ? 'white' : 'black';
        let captures = this.checkCaptures(position, colour, anticolour);
        k.previouslyCaptured = [];
        k.previouslyCaptured.push(...captures[0]);
        k.previouslyCaptured.push(...captures[1]);
        for(let i of k.previouslyCaptured) {
            k.placedSprites[i].destroy();
            k.placedSprites[i] = undefined;
        }
        k.capturedScore[k.currentPlayer] += k.previouslyCaptured.length;
    },
    handleMouseUp: function() {
        if(k.hoveringStone) {
            let hej = this.closestPos();
            this.addNewSprite(hej);
            this.captureStones(hej);

            // update other stuff
            k.consecutivePasses = 0;
            this.changeTurn(hej);
        }
    },
    updatePermittedPlacements: function(previousPlacement) {
        dprint("updating permitted placements");
        dprint("current player is " + k.currentPlayer);
        k.permittedPlacements.forEach((value, i) => {
            dprint(i);
            let permitted = true;
            if(k.placedSprites[i] != undefined) {
                // may not place where stones exist
                dprint("blocked");
                permitted = false;
            }
            else {
                // suicide prevention
                let surrounded = [0, 0]; // 0
                let colour = k.currentPlayer == 0 ? 'black' : 'white';
                let anticolour = k.currentPlayer == 0 ? 'white' : 'black';
                let directions = [-1, 1];
                directions.forEach((dir, j) => {
                    let hoj = i + dir;
                    while(k.placedSprites[hoj] != undefined && k.placedSprites[hoj].key == anticolour) {
                        // skip over the stones of the next player's colour
                        hoj += dir;
                    }
                    if(k.placedSprites[hoj] == undefined) {
                        if(hoj == -1 || hoj == 19) {
                            // an edge is equivalent to an enemy stone
                            surrounded[j] = true;
                        }
                        else {
                            surrounded[j] = false;
                        }
                    }
                    else if(k.placedSprites[hoj].key == colour) {
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
                    if(this.μ(i, previousPlacement, capture)) {
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
    },
    μ: function(position, previousPlacement, placementCapture) { // 🐮 muuuu
        // ko if all of the following:
        // exactly one stone captured in the previous move,
        let oneCaptured = k.previouslyCaptured.length == 1;
        // the placed stone is at this position,
        let atCaptured = k.previouslyCaptured[0] == position;
        // the placed stone will capture exactly one stone,
        // which happens to be the stone previously used for capturing!
        let capturePrevious = placementCapture.length == 1 && placementCapture[0] == previousPlacement;
        return oneCaptured && atCaptured && capturePrevious;
    },
    calculateDeadStones: function() {
        // probably skip this
    },
    calculateAreaScores: function() {
        dprint("Calculating area scores:");
        let spaces = 0;
        let last_colour = undefined;
        let colour_match = (colour) => {
            let first_stone = last_colour == undefined;
            let colour_match = colour == last_colour;
            return first_stone || colour_match;
        };
        for(let i = 0; i < 19; ++i) {
            let sprite = k.placedSprites[i];
            dprint(i);
            dprint(sprite);
            if(sprite == undefined) {
                spaces++;
                dprint("empty space, spaces now " + spaces);
            }
            else {
                if(colour_match(sprite.key)) {
                    let colourIndex = sprite.key == 'black' ? 0 : 1;
                    k.areaScore[colourIndex] += spaces;
                    dprint("matched stone colour, given " + spaces);
                }
                else {
                    dprint("non-matching stone colour, reset spaces");
                }
                spaces = 0;
                last_colour = sprite.key;
            }
        };
        if(spaces > 0) {
            // last unmatched spaces given to last_colour
            if(last_colour != undefined) {
                let colourIndex = last_colour == 'black' ? 0 : 1;
                k.areaScore[colourIndex] += spaces;
            }
        }
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
