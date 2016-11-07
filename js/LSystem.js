var SEPARATOR = '';
var PUSH_LETTER = '[';
var POP_LETTER = ']';

// A simple IL-system
// Axiom defines the starting word
// Context is a string of letters that can factor into contextual rules
// Rules (productions) look like { a: 'ab', b: [ LSystemRule1, LSystemRule2 ] }
function LSystem(axiom, rules, context) {
  this.word = axiom;
  this.rules = rules;
  this.context = context;
};

// An l-system production predicate
// res is the resulting letter
// prob is the probability with which it occurs (defaults to 100%)
//   NOTE: sum(prob) over all predicates of a given letter should be <= 100%
// lContext is the path required on the left side of the letter
// rContext is the axial tree required on the right side of the letter
// minN is the minimum n which will activate the gene
// maxN is the minimum n which will activate the gene
function LSystemRule(res, prob, lContext, rContext, minN, maxN) {
  this.res = res;
  this.prob = prob || 100;
  this.lContext = lContext;
  this.rContext = rContext;
  if(minN == undefined){
  	minN = -1;
  }
  if(maxN == undefined){
  	maxN = 10000;
  }
  this.minN = minN;
  this.maxN = maxN;
  console.log(minN);
}

// TODO: CLEAN THIS MOTHER UP!!!
// TODO: At some point it might be nice to pass the turtle in
//       and check which rules are push/pop, rather than reserving []
// Check if the letter at a given index in the word
// satisfies the contextual conditions of a given LSystemRule
LSystem.prototype.checkContext = function(ind, rule) {
  var level, targetLevel, context, contextInd, wordInd;

  // Left context /////////////////////////////////////////////////
  // Must be a path towards the root (i.e. cannot contain branches)
  level = 0;
  targetLevel = 0;
  context = rule.lContext;
  contextInd = context ? context.length - 1 : -1;
  wordInd = ind - 1;
  if (context) {
    while (contextInd > -1 && wordInd > -1) {
      var targetLetter = context[contextInd];

      var letter = this.word[wordInd];
      if (letter === PUSH_LETTER) {
        level--;
        // Once we go down a level, we shouldn't ever look back up
        targetLevel = Math.min(level, targetLevel);
      } else if (letter === POP_LETTER) {
        level++;
      } else if (level === targetLevel && this.context.indexOf(letter) > -1) {
        if (letter !== targetLetter) return false;
        contextInd--;
      }

      wordInd--;
    }

    if (contextInd > -1) return false;
  }
  // End left context /////////////////////////////////////////////

  // Right context ////////////////////////////////////////////////
  // Can be any axial tree
  level = 0;
  targetLevel = 0;
  context = rule.rContext;
  contextInd = 0;
  wordInd = ind + 1;
  if (context) {
    // Never look backwards towards the root (drop below starting level)
    while (level > -1 && contextInd < context.length && wordInd < this.word.length) {
      var targetLetter = context[contextInd];
      // If the next section of the context is down a level,
      // we can ignore the rest of this level (until level--)
      if (targetLetter === POP_LETTER) targetLevel--;

      var letter = this.word[wordInd];
      if (letter === PUSH_LETTER) {
        level++;
        if (letter === targetLetter) {
          contextInd++;
          targetLevel++;
        }
      } else if (letter === POP_LETTER) {
        level--;
        if (letter === targetLetter) contextInd++;
      } else if (level === targetLevel && this.context.indexOf(letter) > -1) {
        if (letter !== targetLetter) return false;
        contextInd++;
      }

      wordInd++;
    }

    if (contextInd < context.length) return false;
  }
  // End right context ////////////////////////////////////////////

  return true;
};

// Step the L-System according to the rules
LSystem.prototype.step = function(n) {
  var letters = this.word.split(SEPARATOR);
  for (var i = 0; i < letters.length; i++) {
    var letter = letters[i];
    var rule = this.rules[letter];
    var res = rule;

    // Rule can be an array of LSystemRules
    // Unaccounted-for probability defaults to `letter`
    // If no rule finds a context match, defaults to `letter`
    if (Array.isArray(rule)) {
      res = null;
      var prob = 0;
      var rand = Math.random() * 100;

      for (var j = 0; j < rule.length; j++) {
        var lSystemRule = rule[j];
        if (rand < (prob += lSystemRule.prob)) {
          if (this.checkContext(i, lSystemRule)) {
          	//console.log(n + " was n\n");
          	//console.log(lSystemRule.minN + " was min\n");
          	//console.log(lSystemRule.maxN + " was max\n");
          	if(n>lSystemRule.minN&&n<lSystemRule.maxN){
            	res = lSystemRule.res;
            	break;
        	}
          }
        }
      }
    }

    letters[i] = res || letter;
  }
  this.word = letters.join(SEPARATOR);
};

LSystem.Rule = LSystemRule;

module.exports = LSystem;