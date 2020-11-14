const staticDir = "../static/";

const getSpritePath = function(spriteName) {
    return staticDir + "sprites/" + spriteName + ".png";
};

const getSfxPath = function(sfxName) {
    return staticDir + "sfx/" + sfxName + ".wav";
};

const getScriptPath = function(scriptName) {
    return staticDir + "js/" + scriptName + ".js";
};

const colour = {
    bg:        '#091f34', // dark blue
    fg:        '#fdfdfd',
    white:     '#fdfdfd',
    pink:      '#fc8cc0',
    red:       '#fd2970',
    orange:    '#fd8e25',
    yellow:    '#f2e31d',
    green:     '#7efebe',
    lightBlue: '#6ee5fd',
    darkBlue:  '#2c6795',
}

const textStyle = {
    large: {
        font: '56px vcrosdmono',
        fill: colour.fg,
    },
    medium: {
        font: '48px vcrosdmono',
        fill: colour.fg
    },
};

const world = {
    w: 1366,
    h: 768,
    length: 20, // number of tiles wide
    tileSize: 64,
    tileScale: 4, // assume all tile PNGs are 16x16
    xOffset: (1366 / 20) / 2 + 16, // idk lol
    yOffset: (768 / 2) - 32,
};
