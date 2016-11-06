var SEPARATOR = '';

// A simple DOL-system
// Axiom defines the starting word
// Rules (productions) look like { a: 'ab', b: 'a' }
function LSystem(axiom, rules) {
  this.word = axiom;
  this.rules = rules;
};

function StochasticRule(res, prob) {
  this.res = res;
  this.prob = prob;
}

LSystem.prototype.step = function() {
  var letters = this.word.split(SEPARATOR);
  for (var i = 0; i < letters.length; i++) {
    var letter = letters[i];
    var rule = this.rules[letter];
    var res = rule;

    // Rule can be an array of StochasticRules
    // Unaccounted for probability defaults to `letter`
    if (Array.isArray(rule)) {
      res = null;
      var prob = 0;
      var rand = Math.random() * 100;

      for (var j = 0; j < rule.length; j++) {
        var stochasticRule = rule[j];
        if (rand < (prob += stochasticRule.prob)) {
          res = stochasticRule.res;
          break;
        }
      }
    }

    letters[i] = res || letter;
  }
  this.word = letters.join(SEPARATOR);
};

LSystem.StochasticRule = StochasticRule;

module.exports = LSystem;