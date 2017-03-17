'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var MainState = function() {};
MainState.prototype = {
    button1: undefined,
    button2: undefined,

    worldLength: 3,
    tileSize: 64,
    xOffset: 587,
    yPosition: (768 / 2) - 32,
    tileScale: undefined,

    gameover: false,
    playing: false,
    bg: undefined,
    ai: {
        clock: undefined,
        pausing: true,
        pauseTime: 1000,
        hoverTime: 1500,
    },

    player: {
        // is an object so that it's taken as a reference in the buttons so they can read them in their context
        player: 1,
        pvp: true,
        state: undefined,
        infoText: undefined,
    },
    buttonsLeft: 3,
    buttons: [],
    tempButtons: [],

    startGameAI: function() {
        this.player.pvp = false;
        this.player.player = util.randomBool() + 1;
        this.player.infoText.text = this.player.player == 1 ? "Player's turn" : "Computer's turn";
        this.ai.clock = Date.now();
        this.startGame();
    },
    startGame: function() {
        game.stage.backgroundColor = "#FFFFFF";
        this.bg.visible = true;
        this.button1.visible = false;
        this.button2.visible = false;

        this.buttons.forEach(function(button) {
            button.inputEnabled = true;
            button.visible = true;
        });
        this.player.state = util.randomBool() ? 'crosses' : 'noughts';

        this.playing = true;

        if(this.player.pvp) {
            this.player.infoText.text = "Player one's turn";
        }
        this.player.infoText.visible = true;
        util.recentreText(this.player.infoText, {x: 1366 / 2, y: 200});
    },

    preload: function() {
        this.tileScale = this.tileSize / 16;

        game.load.spritesheet('button1', 'assets/sprites/button1.png', 200, 60, 2);
        game.load.spritesheet('button2', 'assets/sprites/button2.png', 200, 60, 2);
        game.load.spritesheet('tile',    'assets/sprites/tile_button.png', 16, 16, 5);

        game.load.image('bg', 'assets/sprites/bg.png');

        game.load.audio('blopp2', 'assets/sfx/blopp2.wav');

	    game.load.script('utilScript',          '../js/util.js');
	    game.load.script('directionEnumScript', '../js/direction.enum.js');
	    game.load.script('keycodesScript',      '../js/keycodes.js');

        // necessary to preload the font lol
        game.add.text(0, 0, "", {font: '56px pixelbug', fill: '#ffffff'});
    },
    create: function() {
        this.bg = game.add.sprite(0, 0, 'bg');
        this.bg.visible = false;
        game.stage.backgroundColor = "#000000";
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        this.blopp2SFX = game.add.audio('blopp2');

        this.button1 = game.add.button(481, 200, 'button1', this.startGameAI, this, 1, 0, 1);
        this.button2 = game.add.button(685, 200, 'button2', this.startGame, this, 1, 0, 1);

        for(var i = 0; i < this.worldLength; ++i) {
            var button = game.add.button(i * this.tileSize + this.xOffset, this.yPosition, 'tile', this.checkClickButton, this);
            button.scale.set(this.tileScale, this.tileScale);
            button.player = this.player; // hack to be able to access the player states within the button contexts from the over/out/on callbacks
            button.ai = this.ai;

            button.onInputOver.add(function() {
                this.frame = this.player.state == 'crosses' ? 1 : 2;
            }, button);

            button.onInputOut.add(function() {
                this.frame = 0;
            }, button);

            button.onInputUp.add(function() {
                this.frame = this.player.state == 'crosses' ? 3 : 4;
                this.player.state = this.player.state == 'noughts' ? 'crosses' : 'noughts';
                this.player.player = this.player.player == 1 ? 2 : 1;
                this.inputEnabled = false;

                if(this.player.pvp)
                    this.player.infoText.text = this.player.player == 1 ? "Player one's turn" : "Player two's turn";
                else
                    this.player.infoText.text = this.player.player == 1 ? "Player's turn" : "Computer's turn";

                util.recentreText(this.player.infoText, {x: 1366 / 2, y: 200});

                if(!this.player.pvp && this.player.player == 2) {
                    // need to disable buttons, too
                    this.ai.clock = Date.now();
                    this.ai.pausing = true;
                }

            }, button);

            this.buttons.push(button);
            button.inputEnabled = false;
            button.visible = false;
        }
        this.player.infoText = game.add.text(1366 / 2, 200, "", {font: '32px pixelbug', fill: '#ffffff'});
        this.player.infoText.visible = false;
        util.recentreText(this.player.infoText, {x: 1366 / 2, y: 200});
    },
    update: function() {
        if(!this.gameover && this.playing) {
            if(!this.player.pvp && this.player.player == 2) {
                // if it's the AI's turn
                var timeElapsed = Date.now() - this.ai.clock;
                if(this.ai.pausing && timeElapsed > this.ai.pauseTime) {
                    this.ai.pausing = false;
                    var selected = util.randomInt(this.buttonsLeft - 1);

                    for(var i = 0, j = 0; i < this.buttons.length; ++i) {
                        var button = this.buttons[i];
                        if(button.inputEnabled) {
                            if(j == selected) {
                                button.frame = this.player.state == 'crosses' ? 1 : 2;
                                break;
                            }
                            else {
                                ++j;
                            }
                        }
                    }
                }
                else if(timeElapsed > (this.ai.pauseTime + this.ai.hoverTime)) {
                    for(var i = 0; i < this.buttons.length; ++i) {
                        var button = this.buttons[i];
                        var frame = button.frame;
                        if(frame == 1 || frame == 2) {
                            button.frame = frame == 1 ? 3 : 4;
                            button.inputEnabled = false;
                            this.player.state = this.player.state == 'noughts' ? 'crosses' : 'noughts';
                            this.player.player = this.player.player == 1 ? 2 : 1;
                            this.player.infoText.text = "Player's turn";
                            util.recentreText(this.player.infoText, {x: 1366 / 2, y: 200});
                            break;
                        }
                    }
                }
            }

            this.buttonsLeft = 3;
            for(var i = 0; i < this.buttons.length; ++i) {
                var button = this.buttons[i];
                if(!button.inputEnabled)
                    --this.buttonsLeft;
            }
            if(this.buttonsLeft <= 0) {
                this.gameover = true;
                this.player.infoText.text = "Draw!"
                util.recentreText(this.player.infoText, {x: 1366 / 2, y: 200});
            }
        }
        else if(this.gameover) {
            // draw!
        }
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
