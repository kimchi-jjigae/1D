'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var MainState = function() {};
MainState.prototype = {
    worldLength: 20,
    tileSize: 64,
    xOffset: 43,
    yPosition: (768 / 2) - 32,
    tileScale: undefined,
    rightWasDown: false,

    startTime: undefined,
    gameover: false,

    timeText: undefined,
    mineText: undefined,

    blopp2SFX: undefined,

    mineCount: 5,
    flagCount: 5,
    tiles: [],
    buttons: [],
    flags: [],
    hoveredTile: undefined,
    faceSprite: undefined,

    preload: function() {
        // allow the player to right click without the menu popping up
        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }

        this.startTime = Date.now();

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
        game.load.image('wrong',    'assets/sprites/wrong.png');

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
            this.tiles.push(undefined); 
            this.buttons.push(undefined);
            this.flags.push(undefined);
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

                if(i != 1)
                    hej = this.tiles[i - 1] === 'M' ? 1 : 0;

                if(i != 19)
                    hoj = this.tiles[i + 1] === 'M' ? 1 : 0;

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
            var button = game.add.button(i * this.tileSize + this.xOffset, this.yPosition, 'tile_button', this.checkClickButton, this, 0, 1, 2);
            button.scale.set(this.tileScale, this.tileScale);
            this.buttons[i] = button;
            button.inputEnabled2 = true;
        }

        this.mineText = game.add.text(this.xOffset, 0, this.flagCount, {font: '56px pixelbug', fill: '#ffffff'});
        this.timeText = game.add.text(1366 - this.xOffset, 0, "0", {font: '56px pixelbug', fill: '#ffffff'});
    },
    update: function() {
        if(!this.gameover) {
            this.mineText.text = this.flagCount;
            var secondsElapsed = (Date.now() - this.startTime) / 1000;
            this.timeText.text = Math.floor(secondsElapsed);
            util.rightAlignText(this.timeText, 1366 - this.xOffset);
            
            this.checkMouseInput();

            if(this.checkWin()) {
                this.win();
            }
        }
    },
    checkMouseInput: function() {
        if(game.input.activePointer.leftButton.isDown) {
            this.faceSprite.frame = 1; // :o
        }
        else if(game.input.activePointer.leftButton.isUp) {
            this.faceSprite.frame = 0; // :)
        }

        if(game.input.activePointer.rightButton.isDown) {
            this.rightWasDown = true;
            // hack to disable button right click
            this.buttons.forEach(function(button) {
                if(button != undefined) {
                    button.inputEnabled = false;
                }
            });
        }
        else if(game.input.activePointer.rightButton.isUp) {
            // hack to disable button right click
            this.buttons.forEach(function(button) {
                if(button != undefined) {
                    if(button.inputEnabled2) // more hacks lol
                        button.inputEnabled = true;
                }
            });
            if(this.rightWasDown) {
                this.rightClick();
                this.rightWasDown = false;
            }
        }
    },
    checkClickButton: function() {
        var index = (game.input.mousePointer.x - this.xOffset) / this.tileSize;
        index = Math.floor(index);
        this.checkClick(index);
    },
    checkClick: function(index, direction) {
        this.buttons[index].visible = false;
        var tile = this.tiles[index];

        if(tile == 'M') {
            this.lose(index);
        }
        else if(tile == 0) {
            if(index != 1) {
                var newIndex = index - 1;
                var newTile = this.tiles[newIndex];
                this.buttons[newIndex].visible = false;
                while(newTile != 'M' && newIndex != 0) {
                    this.buttons[newIndex].visible = false;
                    --newIndex;
                    newTile = this.tiles[newIndex];
                }
            }

            if(index != 19) {
                var newIndex = index + 1;
                var newTile = this.tiles[newIndex];
                this.buttons[newIndex].visible = false;
                while(newTile != 'M' && newIndex != 20) {
                    this.buttons[newIndex].visible = false;
                    ++newIndex;
                    newTile = this.tiles[newIndex];
                }
            }
            this.blopp2SFX.play();
        }
        else if(tile == 1 || tile == 2) {
            this.blopp2SFX.play();
        }
    },
    rightClick: function() {
        var index = (game.input.mousePointer.x - this.xOffset) / this.tileSize;
        index = Math.floor(index);
        if(this.buttons[index].visible) {
            var flag = this.flags[index];
            if(flag == undefined) {
                var sprite = game.add.sprite(index * this.tileSize + this.xOffset, this.yPosition, 'flag');
                sprite.scale.set(this.tileScale, this.tileScale);
                this.flags[index] = sprite;
                --this.flagCount;
                this.buttons[index].inputEnabled = false;
                this.buttons[index].inputEnabled2 = false; // hacks h4x h4ck0rz
            }
            else if(flag.key == 'flag') {
                flag.destroy();
                var sprite = game.add.sprite(index * this.tileSize + this.xOffset, this.yPosition, 'question');
                sprite.scale.set(this.tileScale, this.tileScale);
                this.flags[index] = sprite;
                ++this.flagCount;
            }
            else if(flag.key == 'question') {
                flag.destroy();
                this.flags[index] = undefined;
                this.buttons[index].inputEnabled = true;
                this.buttons[index].inputEnabled2 = true;
            }
        }
    },
    checkWin: function() {
        var visibleCount = 0;
        this.buttons.forEach(function(button) {
            if(button != undefined) {
                if(button.visible == true)
                    ++visibleCount;
            }
        });
        return visibleCount == this.mineCount;
    },
    win: function() {
        this.mineText.text = 0;
        this.buttons.forEach(function(button) {
            if(button != undefined) {
                button.inputEnabled = false;
            }
        });
        this.faceSprite.frame = 3; // B)
        this.gameover = true;
    },
    lose: function(index) {
        this.buttons.forEach(function(button) {
            if(button != undefined) {
                button.visible = false;
            }
        });
        for(var i = 1; i < this.flags.length; ++i) {
            var flag = this.flags[i];
            if(flag != undefined) {
                flag.visible = false;
                if(flag.key == 'flag' && this.tiles[i] != 'M') {
                    var sprite = game.add.sprite(i * this.tileSize + this.xOffset, this.yPosition, 'wrong');
                    sprite.scale.set(this.tileScale, this.tileScale);
                }
            }
        }

        var red = game.add.sprite(index * this.tileSize + this.xOffset, this.yPosition, 'mine_red');
        red.scale.set(this.tileScale, this.tileScale);
        this.explosionSFX.play();
        this.faceSprite.frame = 2; // x(

        this.gameover = true;
    },
};

game.state.add('MainState', MainState);
game.state.start('MainState');
