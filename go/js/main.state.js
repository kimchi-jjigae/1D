'use strict';

var game = new Phaser.Game(1366, 768, Phaser.AUTO, '', null, false, false);

var K = function() {};
K.prototype = {
};

var k = new K();
var MainState = function() {};

MainState.prototype = {
    preload: function() {
        game.load.image('black', 'assets/sprites/black.png');
        game.load.image('black_hover', 'assets/sprites/black_hover.png');
        game.load.image('white', 'assets/sprites/white.png');
        game.load.image('white_hover', 'assets/sprites/white_hover.png');
        game.load.image('bg', 'assets/sprites/bg.png');

	    game.load.script('utilScript',          '../js/util.js');
	    game.load.script('directionEnumScript', '../js/direction.enum.js');
	    game.load.script('keycodesScript',      '../js/keycodes.js');
        game.add.text(0, 0, "", {font: '56px pixelbug', fill: '#ffffff'});
    },
    create: function() {
        //game.add.sprite(0, 0, 'bg');
        game.stage.backgroundColor = "#FFFFFF";
        game.scale.pageAlignHorizontally = true;  game.scale.pageAlignVertically = true;

        this.scoreText = game.add.text(0, 0, "Score: 0", {font: '56px pixelbug', fill: '#ffffff'});
        game.stage.smoothed = false;
    },
    update: function() {
    },
    eatTail: function() {
    }
};

game.state.add('MainState', MainState);
game.state.start('MainState');
