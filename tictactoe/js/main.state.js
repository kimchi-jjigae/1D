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
    pvp: true,
    bg: undefined,

    player: {
        // is an object so that it's taken as a reference in the buttons so they can read them in their context
        state: undefined,
    },
    thingCount: 0,
    thingMax: 3,
    buttons: [],

    startGameAI: function() {
        this.pvp = false;
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

            button.onInputOver.add(function() {
                this.frame = this.player.state == 'crosses' ? 1 : 2;
            }, button);

            button.onInputOut.add(function() {
                this.frame = 0;
            }, button);

            button.onInputUp.add(function() {
                this.frame = this.player.state == 'crosses' ? 3 : 4;
                this.player.state = this.player.state == 'noughts' ? 'crosses' : 'noughts';
                this.inputEnabled = false;
            }, button);

            this.buttons.push(button);
            button.inputEnabled = false;
            button.visible = false;
        }
    },
    update: function() {
        if(!this.gameover && this.playing) {
            // then check if AI or human

            this.thingCount = 3;
            for(var i = 0; i < this.buttons.length; ++i) {
                var button = this.buttons[i];
                if(button.inputEnabled)
                    --this.thingCount;
            }
            if(this.thingCount >= this.thingMax) {
                this.gameover = true;
            }
        }
        else if(this.gameover) {
            // draw!
        }
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
