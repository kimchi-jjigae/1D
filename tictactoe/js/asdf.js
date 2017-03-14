"use strict"
var game=new Phaser.Game(1366,768,Phaser.AUTO,"",null,!1,!1),MainState=function(){}
MainState.prototype={worldLength:20,tileSize:64,xOffset:43,yPosition:352,tileScale:void 0,rightWasDown:!1,startTime:void 0,gameover:!1,timeText:void 0,mineText:void 0,blopp2SFX:void 0,mineCount:5,flagCount:5,tiles:[],buttons:[],flags:[],hoveredTile:void 0,faceSprite:void 0,preload:function(){game.canvas.oncontextmenu=function(t){t.preventDefault()},this.startTime=Date.now(),this.tileScale=this.tileSize/16,game.load.image("bg","assets/sprites/bg.png"),game.load.image("flag","assets/sprites/flag.png"),game.load.image("question","assets/sprites/question.png"),game.load.image("one","assets/sprites/one.png"),game.load.image("two","assets/sprites/two.png"),game.load.image("empty","assets/sprites/empty.png"),game.load.image("mine","assets/sprites/mine.png"),game.load.image("mine_red","assets/sprites/mine_red.png"),game.load.image("wrong","assets/sprites/wrong.png"),game.load.spritesheet("face","assets/sprites/face.png",16,16,4),game.load.spritesheet("tile_button","assets/sprites/tile_button.png",16,16,3),game.load.audio("blopp2","assets/sfx/blopp2.wav"),game.load.audio("explosion","assets/sfx/explosion.wav"),game.load.script("utilScript","../js/util.js"),game.load.script("directionEnumScript","../js/direction.enum.js"),game.load.script("keycodesScript","../js/keycodes.js"),game.add.text(0,0,"",{font:"56px pixelbug",fill:"#ffffff"})},create:function(){game.add.sprite(0,0,"bg"),game.stage.backgroundColor="#FFFFFF",game.scale.pageAlignHorizontally=!0,game.scale.pageAlignVertically=!0,this.blopp2SFX=game.add.audio("blopp2"),this.explosionSFX=game.add.audio("explosion"),this.faceSprite=game.add.sprite(0*this.tileSize+this.xOffset,this.yPosition,"face"),this.faceSprite.scale.set(this.tileScale,this.tileScale)
for(var t=0;t<this.worldLength;++t)this.tiles.push(void 0),this.buttons.push(void 0),this.flags.push(void 0)
for(var i=[],t=0;t<this.mineCount;++t){for(var e=util.randomInt(1,this.worldLength);i.indexOf(e)!=-1;)e=util.randomInt(1,this.worldLength)
i.push(e)
var s=game.add.sprite(e*this.tileSize+this.xOffset,this.yPosition,"mine")
s.scale.set(this.tileScale,this.tileScale),this.tiles[e]="M"}for(var t=1;t<this.worldLength;++t)if(void 0==this.tiles[t]){var a=0,o=0,n=0
1!=t&&(o="M"===this.tiles[t-1]?1:0),19!=t&&(n="M"===this.tiles[t+1]?1:0),a+=o,a+=n
var l
0==a?(l="empty",this.tiles[t]=0):1==a?(l="one",this.tiles[t]=1):2==a&&(l="two",this.tiles[t]=2)
var s=game.add.sprite(t*this.tileSize+this.xOffset,this.yPosition,l)
s.scale.set(this.tileScale,this.tileScale)}for(var t=1;t<this.worldLength;++t){var h=game.add.button(t*this.tileSize+this.xOffset,this.yPosition,"tile_button",this.checkClickButton,this,0,1,2)
h.scale.set(this.tileScale,this.tileScale),this.buttons[t]=h,h.inputEnabled2=!0}this.mineText=game.add.text(this.xOffset,0,this.flagCount,{font:"56px pixelbug",fill:"#ffffff"}),this.timeText=game.add.text(1366-this.xOffset,0,"0",{font:"56px pixelbug",fill:"#ffffff"})},update:function(){if(!this.gameover){this.mineText.text=this.flagCount
var t=(Date.now()-this.startTime)/1e3
this.timeText.text=Math.floor(t),util.rightAlignText(this.timeText,1366-this.xOffset),this.checkMouseInput(),this.checkWin()&&this.win()}},checkMouseInput:function(){game.input.activePointer.leftButton.isDown?this.faceSprite.frame=1:game.input.activePointer.leftButton.isUp&&(this.faceSprite.frame=0),game.input.activePointer.rightButton.isDown?(this.rightWasDown=!0,this.buttons.forEach(function(t){void 0!=t&&(t.inputEnabled=!1)})):game.input.activePointer.rightButton.isUp&&(this.buttons.forEach(function(t){void 0!=t&&t.inputEnabled2&&(t.inputEnabled=!0)}),this.rightWasDown&&(this.rightClick(),this.rightWasDown=!1))},checkClickButton:function(){var t=(game.input.mousePointer.x-this.xOffset)/this.tileSize
t=Math.floor(t),this.checkClick(t)},checkClick:function(t,i){this.buttons[t].visible=!1
var e=this.tiles[t]
if("M"==e)this.lose(t)
else if(0==e){if(1!=t){var s=t-1,a=this.tiles[s]
for(this.buttons[s].visible=!1;"M"!=a&&0!=s;)this.buttons[s].visible=!1,--s,a=this.tiles[s]}if(19!=t){var s=t+1,a=this.tiles[s]
for(this.buttons[s].visible=!1;"M"!=a&&20!=s;)this.buttons[s].visible=!1,++s,a=this.tiles[s]}this.blopp2SFX.play()}else 1!=e&&2!=e||this.blopp2SFX.play()},rightClick:function(){var t=(game.input.mousePointer.x-this.xOffset)/this.tileSize
if(t=Math.floor(t),this.buttons[t].visible){var i=this.flags[t]
if(void 0==i){var e=game.add.sprite(t*this.tileSize+this.xOffset,this.yPosition,"flag")
e.scale.set(this.tileScale,this.tileScale),this.flags[t]=e,--this.flagCount,this.buttons[t].inputEnabled=!1,this.buttons[t].inputEnabled2=!1}else if("flag"==i.key){i.destroy()
var e=game.add.sprite(t*this.tileSize+this.xOffset,this.yPosition,"question")
e.scale.set(this.tileScale,this.tileScale),this.flags[t]=e,++this.flagCount}else"question"==i.key&&(i.destroy(),this.flags[t]=void 0,this.buttons[t].inputEnabled=!0,this.buttons[t].inputEnabled2=!0)}},checkWin:function(){var t=0
return this.buttons.forEach(function(i){void 0!=i&&1==i.visible&&++t}),t==this.mineCount},win:function(){this.mineText.text=0,this.buttons.forEach(function(t){void 0!=t&&(t.inputEnabled=!1)}),this.faceSprite.frame=3,this.gameover=!0},lose:function(t){this.buttons.forEach(function(t){void 0!=t&&(t.visible=!1)})
for(var i=1;i<this.flags.length;++i){var e=this.flags[i]
if(void 0!=e&&(e.visible=!1,"flag"==e.key&&"M"!=this.tiles[i])){var s=game.add.sprite(i*this.tileSize+this.xOffset,this.yPosition,"wrong")
s.scale.set(this.tileScale,this.tileScale)}}var a=game.add.sprite(t*this.tileSize+this.xOffset,this.yPosition,"mine_red")
a.scale.set(this.tileScale,this.tileScale),this.explosionSFX.play(),this.faceSprite.frame=2,this.gameover=!0}},game.state.add("MainState",MainState),game.state.start("MainState")
