'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var MainState = function() {};
MainState.prototype = {
    worldLength: 20,
    tileSize: 64,
    xOffset: 43,
    yPosition: (768 / 2) - 32,
    tileScale: undefined,

    timeText: undefined,
    mineText: undefined,

    blopp2SFX: undefined,

    mineCount: 5,
    tiles: [],

    preload: function() {
        this.tileScale = this.tileSize / 16;
        game.load.image('bg',       'assets/sprites/bg.png');

        // unclicked
        game.load.image('flag',     'assets/sprites/flag.png');
        game.load.image('question', 'assets/sprites/question.png');

        // clicked
        game.load.image('one',      'assets/sprites/one.png');
        game.load.image('two',      'assets/sprites/two.png');
        game.load.image('empty',    'assets/sprites/empty.png');
        game.load.image('mine',     'assets/sprites/mine.png');
        game.load.image('mine_red', 'assets/sprites/mine_red.png');

        game.load.spritesheet('face',        'assets/sprites/face.png',        16, 16, 4);
        game.load.spritesheet('tile_button', 'assets/sprites/tile_button.png', 16, 16, 3);

        game.load.audio('blopp2',    'assets/sfx/blopp2.wav');
        game.load.audio('explosion', 'assets/sfx/explosion.wav');

	    game.load.script('utilScript',          '../js/util.js');
	    game.load.script('directionEnumScript', '../js/direction.enum.js');
	    game.load.script('keycodesScript',      '../js/keycodes.js');

        // necessary to preload the font lol
        game.add.text(0, 0, "", {font: '56px pixelbug', fill: '#ffffff'});
    },
    create: function() {
        game.add.sprite(0, 0, 'bg');
        game.stage.backgroundColor = "#FFFFFF";
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        this.blopp2SFX = game.add.audio('blopp2');
        this.explosionSFX = game.add.audio('explosion');

        this.faceSprite = game.add.sprite(0 * this.tileSize + this.xOffset, this.yPosition, 'face');
        this.faceSprite.scale.set(this.tileScale, this.tileScale);

        for(var i = 0; i < this.worldLength; ++i) {
            this.tiles.push(undefined); // magic numbers omfg
        }

        // so firstly, we want to work out where all the mines should be placed: 5 of them between position 1 and 39 (0 is the face)
        var minePositions = [];
        for(var i = 0; i < this.mineCount; ++i) {
            var newPos = util.randomInt(1, this.worldLength);
            while(minePositions.indexOf(newPos) != -1) {
                newPos = util.randomInt(1, this.worldLength);
            }
            minePositions.push(newPos);

            // add a mine sprite at this position
            var sprite = game.add.sprite(newPos * this.tileSize + this.xOffset, this.yPosition, 'mine');
            sprite.scale.set(this.tileScale, this.tileScale);

            this.tiles[newPos] = 'M';
        }

        // secondly, check what number the other positions should have
        for(var i = 1; i < this.worldLength; ++i) {
            if(this.tiles[i] == undefined) {
                var count = 0;
                var hej = 0;
                var hoj = 0;

                if(i != 0)
                    hej = this.tiles[i - 1] === undefined ? 0 : 1;

                if(i != 39)
                    hoj = this.tiles[i + 1] === undefined ? 0 : 1;

                count += hej;
                count += hoj;

                var texture;
                if(count == 0) {
                    texture = "empty";
                    this.tiles[i] = 0;
                }
                else if(count == 1) {
                    texture = "one";
                    this.tiles[i] = 1;
                }
                else if(count == 2) {
                    texture = "two";
                    this.tiles[i] = 2;
                }

                var sprite = game.add.sprite(i * this.tileSize + this.xOffset, this.yPosition, texture);
                sprite.scale.set(this.tileScale, this.tileScale);
            }
        }

        // lastly, cover over all of them with clickable buttons
        for(var i = 1; i < this.worldLength; ++i) {
            var button = game.add.button(i * this.tileSize + this.xOffset, this.yPosition, 'tile_button', this.startGame, this, 0, 1, 2);
            button.scale.set(this.tileScale, this.tileScale);
        }

        this.mineText = game.add.text(this.xOffset, 0, this.mineCount, {font: '56px pixelbug', fill: '#ffffff'});
        /*
        this.score2Text = game.add.text(1300, 0, "0", {font: '56px pixelbug', fill: '#ffffff'});
        */
    },
    update: function() {
        if(this.started) {
        }
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
