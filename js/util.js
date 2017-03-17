var util = {
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
    recentreText: function(text, position) {
        if(position == undefined) {
            text.position.x = text.position.x - text.width / 2;
            text.position.y = text.position.y - text.height / 2;
        }
        else {
            text.position.x = position.x - text.width / 2;
            text.position.y = position.y - text.height / 2;
        }
    },
    rightAlignText: function(text, rightBoundary) {
        if(rightBoundary == undefined)
            text.position.x = text.position.x - text.width;
        else
            text.position.x = rightBoundary - text.width;
    }
};
