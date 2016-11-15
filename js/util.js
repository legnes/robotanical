var util = {};

util.randomInt = function(cap) {
  return Math.floor(Math.random() * cap);
};

util.clone = function(obj) {
  return JSON.parse(JSON.stringify(obj));
};

util.mergeStrings = function() {
  var outStr = '';
  for (var i = 0; i < arguments.length; i++) {
    var str = arguments[i];
    if (!str) continue;
    for (var j = 0; j < str.length; j++) {
      var char = str[j];
      if (outStr.indexOf(char) < 0) {
        outStr += char;
      }
    }
  }
  return outStr;
};

module.exports = util;