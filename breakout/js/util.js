var util = {
    randomFloat: function(a, b) {
        // returns a random float between a and b
        var number = Math.random();
        if(!a) {
            return number;
        }
        else if(!b) {
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
        var number = util.randomFloat(a, b);
        number = Math.floor(number);
        return number;
    },
    recentreText: function(text) {
        text.position.x = text.position.x - text.width / 2;
        text.position.y = text.position.y - text.height / 2;
    }
};
