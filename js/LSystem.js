var SEPARATOR = '';

// A simple DOL-system
// Axiom defines the starting word
// Rules (productions) look like { a: 'ab', b: 'a' }
function LSystem(axiom, rules) {
  this.word = axiom;
  this.rules = rules;
};

LSystem.prototype.step = function() {
  var letters = this.word.split(SEPARATOR);
  for (var i = 0; i < letters.length; i++) {
    var letter = letters[i];
    letters[i] = this.rules[letter] || letter;
  }
  this.word = letters.join(SEPARATOR);
};

module.exports = LSystem;