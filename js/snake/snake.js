"use strict"
var game=new Phaser.Game(1366,768,Phaser.AUTO,"",null,!1,!1),Snake=function(){}
Snake.prototype={length:4,position:4,grow:function(){this.length++},reset:function(){this.length=4,this.position=4}}
var Apple=function(){}
Apple.prototype={position:8,respawn:function(e,t,i){function s(e,t,i){return t>i?e>=i&&e<=t:e<=t||e>=i}for(var a=e%i,o=(e-t)%i+1,n=util.randomInt(20);s(n,a,o);)n=util.randomInt(20)
this.position=n},reset:function(){this.position=8}}
var snake=new Snake,apple=new Apple,MainState=function(){}
MainState.prototype={worldLength:20,tileSize:64,xOffset:43,yPosition:352,tickRate:300,lastTicked:Date.now(),snakeBits:void 0,appleBit:void 0,scoreText:void 0,score:0,gameOver:!1,blopp:void 0,gameoverSFX:void 0,preload:function(){game.load.image("head","assets/sprites/snakehead.png"),game.load.image("snake","assets/sprites/snake.png"),game.load.image("apple","assets/sprites/apple.png"),game.load.image("bg","assets/sprites/bg.png"),game.load.audio("blopp","assets/sfx/blopp1.wav"),game.load.audio("gameover","assets/sfx/gameover.wav"),this.snakeBits=game.add.group(),game.load.script("utilScript","js/util.js"),game.load.script("directionEnumScript","js/direction.enum.js"),game.load.script("keycodesScript","js/keycodes.js"),game.add.text(0,0,"",{font:"56px pixelbug",fill:"#ffffff"})},create:function(){game.add.sprite(0,0,"bg"),game.stage.backgroundColor="#FFFFFF",game.scale.pageAlignHorizontally=!0,game.scale.pageAlignVertically=!0
var e=this.tileSize/16
this.blopp=game.add.audio("blopp"),this.gameoverSFX=game.add.audio("gameover")
var t=this.snakeBits.create(snake.position*this.tileSize+this.xOffset,this.yPosition,"head")
t.scale.set(e,e)
for(var i=1;i<snake.length;++i)t=this.snakeBits.create((snake.position-i)*this.tileSize+this.xOffset,this.yPosition,"snake"),t.scale.set(e,e)
this.appleBit=game.add.sprite(apple.position*this.tileSize+this.xOffset,this.yPosition,"apple"),this.appleBit.scale.set(e,e)
var s=this
game.input.keyboard.onDownCallback=function(e){keycodes.right.includes(e.key)?s.lastTicked=0:keycodes.restart.includes(e.key)&&(apple.reset(),snake.reset(),s.score=0,s.gameOver=!1,s.scoreText.text="Score: "+s.score,s.scoreText.visible=!0,game.stage.backgroundColor="#FFFFFF",game.state.start("MainState"))},this.scoreText=game.add.text(0,0,"Score: 0",{font:"56px pixelbug",fill:"#ffffff"}),game.stage.smoothed=!1},update:function(){if(this.timeToTick()&&!this.gameOver){snake.position++
for(var e=0;e<this.snakeBits.length;++e){var t=this.snakeBits.children[e],i=(snake.position-e)%this.worldLength
t.position.x=i*this.tileSize+this.xOffset}if(this.eatTail()){var s=150
this.scoreText.visible=!1
var a=game.add.text(game.world.width/2,s,"GAME OVER",{font:"56px pixelbug",fill:"#ffffff"}),o=game.add.text(game.world.width/2,s+80,"High score: "+this.score,{font:"48px pixelbug",fill:"#ffffff"}),n=game.add.text(game.world.width/2,s+160,"Your score: "+this.score,{font:"48px pixelbug",fill:"#ffffff"})
util.recentreText(a),util.recentreText(n),util.recentreText(o),this.gameoverSFX.play(),this.gameOver=!0}else if(this.eatApple()){this.score++,this.scoreText.text="Score: "+this.score,snake.grow()
var r=this.tileSize/16,i=(snake.position-snake.length+1)%this.worldLength,t=this.snakeBits.create(i*this.tileSize+this.xOffset,this.yPosition,"snake")
t.scale.set(r,r),this.blopp.play(),snake.length<this.worldLength?(apple.respawn(snake.position,snake.length,this.worldLength),this.appleBit.position.x=apple.position*this.tileSize+this.xOffset):this.appleBit.destroy()}}else this.gameOver},timeToTick:function(){var e=!1
return Date.now()-this.lastTicked>=this.tickRate&&(this.lastTicked=Date.now(),e=!0),e},eatApple:function(){return snake.position%this.worldLength==apple.position},eatTail:function(){var e=snake.position%this.worldLength,t=(snake.position-snake.length)%this.worldLength
return e==t}},game.state.add("MainState",MainState),game.state.start("MainState")
