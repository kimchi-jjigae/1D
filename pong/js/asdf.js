"use strict"
var game=new Phaser.Game(1366,768,Phaser.AUTO,"",null,!1,!1),MainState=function(){}
MainState.prototype={button1:void 0,button2:void 0,worldLength:40,tileSize:32,xOffset:43,yPosition:352,paddle1Position:0,paddle2Position:39,ballPosition:19,ballVelocity:-.5,paddle1Sprite:void 0,paddle2Sprite:void 0,ballSprite:void 0,score1Text:void 0,score2Text:void 0,blopp1SFX:void 0,blopp2SFX:void 0,started:!1,startGame:function(){this.button1.visible=!1,this.button2.visible=!1,this.started=!0},preload:function(){game.load.spritesheet("button1","assets/sprites/button1.png",200,60,2),game.load.spritesheet("button2","assets/sprites/button2.png",200,60,2),game.load.image("paddle","assets/sprites/paddle.png"),game.load.image("paddle2","assets/sprites/paddle2.png"),game.load.image("ball","assets/sprites/ball.png"),game.load.image("bg","assets/sprites/bg.png"),game.load.audio("blopp1","assets/sfx/blopp2.wav"),game.load.script("utilScript","js/util.js"),game.load.script("directionEnumScript","js/direction.enum.js"),game.load.script("keycodesScript","js/keycodes.js"),game.add.text(0,0,"",{font:"56px pixelbug",fill:"#ffffff"})},create:function(){this.button1=game.add.button(0,0,"button1",this.startGame,this,2,1,0),game.add.sprite(0,0,"bg"),game.stage.backgroundColor="#FFFFFF",game.scale.pageAlignHorizontally=!0,game.scale.pageAlignVertically=!0
var t=this.tileSize/8
this.blopp1SFX=game.add.audio("blopp1"),this.paddle1Sprite=game.add.sprite(this.paddle1Position*this.tileSize+this.xOffset,this.yPosition,"paddle"),this.paddle1Sprite.scale.set(t,t),this.paddle2Sprite=game.add.sprite(this.paddle2Position*this.tileSize+this.xOffset,this.yPosition,"paddle2"),this.paddle2Sprite.scale.set(t,t),this.ballSprite=game.add.sprite(this.ballPosition*this.tileSize+this.xOffset,this.yPosition,"ball"),this.ballSprite.scale.set(t,t)
var e=this
game.input.keyboard.onDownCallback=function(t){keycodes.restart.includes(t.key)&&(e.ballPosition=19,e.ballVelocity=-.5,e.scoreText.text="Score: "+e.score,e.scoreText.visible=!0,game.stage.backgroundColor="#FFFFFF",game.state.start("MainState"))},this.score1Text=game.add.text(this.xOffset,0,"0",{font:"56px pixelbug",fill:"#ffffff"}),this.score2Text=game.add.text(1300,0,"0",{font:"56px pixelbug",fill:"#ffffff"})},update:function(){this.started&&(this.ballPosition+=this.ballVelocity,this.ballSprite.position.x=this.ballPosition*this.tileSize+this.xOffset,(this.ballPosition<=this.paddle1Position+1||this.ballPosition>=this.paddle2Position-1)&&(this.ballVelocity*=-1,this.blopp1SFX.play()))}},game.state.add("MainState",MainState),game.state.start("MainState")
