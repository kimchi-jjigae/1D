var util = {
    randomFloat: function(a, b) {
        // returns a random float between a and b
        // includes a but not b
        var number = Math.random();
        if(arguments.length == 0) {
            return number;
        }
        else if(arguments.length == 1) {
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
    recentreText: function(text) {
        text.position.x = text.position.x - text.width / 2;
        text.position.y = text.position.y - text.height / 2;
    }
};
