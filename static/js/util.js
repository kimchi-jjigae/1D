const util = {
    randomFloat: function(a, b) {
        // returns a random float between a and b
        // includes a but not b
        var number = Math.random();
        if(a == undefined && b == undefined) {
            return number;
        }
        else if(b == undefined) {
            b = a;
            a = 0;
        }
        var span = b - a;
        number = number * span;
        number = number + a;
        return number;
    },
    randomInt: function(a, b) {
        // returns a random int between a and b
        // includes a but not b
        var number = util.randomFloat(a, b);
        number = Math.floor(number);
        return number;
    },
    randomBool: function() {
        return util.randomInt(0, 2);
    },
    recentreText: function(text, x, y) {
        const halfTextWidth = text.width / 2;
        text.x = x ? x - halfTextWidth : text.x - halfTextWidth;
        text.y = y ? y : text.y;
    },
    rightAlignText: function(text, rightBoundary) {
        if(rightBoundary == undefined)
            text.x = text.x - text.width;
        else
            text.x = rightBoundary - text.width;
    },
    createTileBg: function(gameGroup, length, spriteName, tileSize, yOffset) {
        for(var i = 0; i < length; ++i) {
            const x = i * tileSize;
            tile = gameGroup.create(x, yOffset, spriteName);
        }
    },
    deviceInPortraitMode: function(game) {
        return !game.device.desktop && game.scale.screenOrientation == "portrait-primary";
    },
    calculateTileScale: function(maxWidth, world) {
        const tileSize = Math.trunc(maxWidth / world.length);
        return tileSize / world.tileSize;
    },
    checkCanvasSize: function(game) {
        /* just in case bla */
    },
};

const flasher = {
    /* objects need a .visible attribute to be made flashy */
    make: function(object, flashCount, tickRate) {
        // double this value to account for both on and off:
        object.flashCountMax = flashCount ? flashCount * 2 : 8;
        object.flashCount = object.flashCountMax;
        object.tickRate = tickRate ? tickRate : 100;
        object.lastTicked = Date.now();
    },
    start: function(object) {
        object.visible = true;
        object.flashCount = 0;
    },
    stop: function(object) {
        object.visible = true;
        object.flashCount = object.flashCountMax;
    },
    update: function(object) {
        if(object.flashCount >= object.flashCountMax) return;
        if(Date.now() - object.lastTicked >= object.tickRate) {
            object.lastTicked = Date.now();
            object.visible = !object.visible;
            ++object.flashCount;
        }
    },
};
const textFlasher = {
    make: function(text, flashCount, flashColour, tickRate) {
        flashColour = flashColour ? flashColour : '#fd2970';
        flasher.make(text, flashCount, tickRate);
        text.originalStyle = text.style;
        text.flashStyle = {
            font: text.style.font,
            fill: flashColour,
            fontSize: text.style.fontSize,
        }
    },
    updateStyleSizes: function(text) {
        // in case the text style has updated due to scaling etc.
        text.originalStyle.fontSize = text.style.fontSize;
        text.flashStyle.fontSize = text.style.fontSize;
    },
    start: function(text) {
        text.setStyle(text.originalStyle);
        text.flashCount = 0;
    },
    stop: function(text) {
        text.setStyle(text.originalStyle);
        text.flashCount = text.flashCountMax;
    },
    update: function(text) {
        if(text.flashCount >= text.flashCountMax) return;
        if(Date.now() - text.lastTicked >= text.tickRate) {
            let style = text.flashCount % 2 == 0 ? text.flashStyle : text.originalStyle;
            text.setStyle(style);
            text.lastTicked = Date.now();
            ++text.flashCount;
        }
    },
};
