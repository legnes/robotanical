(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
function LSystemRule(res, opts) {
  this.res = res;
  this.prob = opts.prob || 100;
  this.lContext = opts.lContext;
  this.rContext = opts.rContext;
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
LSystem.prototype.step = function() {
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
            res = lSystemRule.res;
            break;
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
},{}],2:[function(require,module,exports){
var LSystem = require('./LSystem');
var Turtle = require('./Turtle');
var util = require('./util');

var LINDENMAYER_TURTLE_RULES = {
  'F': Turtle.ACTIONS.FORWARD,
  '-': Turtle.ACTIONS.RIGHT,
  '+': Turtle.ACTIONS.LEFT,
  '[': Turtle.ACTIONS.PUSH,
  ']': Turtle.ACTIONS.POP
};

function Plant(svg, opts) {
  this.svg = svg;
  this.axiom = opts.axiom;
  this.productions = opts.productions;
  this.context = opts.context;
  this.dPosition = opts.dPosition || 1;
  this.dTheta = opts.dTheta || Math.PI / 2;
  this.rules = opts.rules || util.clone(LINDENMAYER_TURTLE_RULES);

  this.lSystem = new LSystem(this.axiom, this.productions, this.context);
  this.turtle = new Turtle(svg,
    this.dPosition,
    this.dTheta,
    this.rules
  );
}

// Seed a new plant from parents
// Contexts get summed, turtle rules use Lindenmayer
// Axiom, angle, dPos, and letter productions are selected
// randomly (across an even distribution) from the parents
Plant.seed = function(svg, parents) {
  var parentCount = parents.length;

  // Resolve child productions and context
  var prodParentInds = {};
  var childProds = {};
  var childContext = '';
  for (var i = 0; i < parentCount; i++) {
    var parent = parents[i];

    // Add the parent context to the child context
    childContext = util.mergeStrings(childContext, parent.context);

    // See if we should clone any of this parent's productions
    for (var letter in parent.productions) {
      if (typeof prodParentInds[letter] === 'undefined') {
        // We haven't come across a production for this letter
        // Choose a parent from which this letter will inherit
        prodParentInds[letter] = util.randomInt(parentCount);
      }

      if (prodParentInds[letter] === i) {
        // Clone the parent's production for this letter
        childProds[letter] = util.clone(parent.productions[letter]);
      }
    }
  }

  return new Plant(svg, {
    axiom: parents[util.randomInt(parentCount)].axiom,
    productions: childProds,
    context: childContext,
    dPosition: parents[util.randomInt(parentCount)].dPosition,
    dTheta: parents[util.randomInt(parentCount)].dTheta
  });
}

/*
Ethan code from main


function ChildPlant(svg, p1, p2){
  var newRules =   [];
  for(var key in p1.lSystem.rules){
    console.log(p1.lSystem.rules[key]);
    newRules[key] = p1.lSystem.rules[key]
    for(var probKey in p1.lSystem.rules[key]){
      var rand = Math.random();
      console.log(rand + " is rand\n");
      if(rand>0.5){
      newRules[key][probKey] = p1.lSystem.rules[key][probKey];
      } else{
        newRules[key][probKey] = p2.lSystem.rules[key][probKey];
      console.log("hey\n")
  }
}

  }
  console.log(p2.lSystem.word + "\n");
  console.log(p1.lSystem.rules[0] + "\n");
 return new Plant(svg, {
  axiom: p2.lSystem.word,
  productions: p1.lSystem.rules,
  dTheta: 27.5 * PI / 180
});
}


var wide = {
  'F': [
    new LSystemRule('F[+F][-F]F[F+F]', { prob: 50 }),
    new LSystemRule('F[+F]F[-F]', { prob: 50 }),
  ]
};

var narrow = {
  'F': [
    new LSystemRule('F-F[+F]F+FF', { prob: 50 }),
    new LSystemRule('F+FF-F[-F]FF', { prob: 50 }),
  ]
};




//Ethan test
plants.push(new Plant(svgs[svgInd++], {
  axiom: 'F',
  productions: wide,
  dTheta: 27.5 * PI / 180
}));

plants.push(new Plant(svgs[svgInd++], {
  axiom: 'F',
  productions: narrow,
  dTheta: 27.5 * PI / 180
}));


plants.push(ChildPlant(svgs[svgInd++], plants[6], plants[7]));
*/

Plant.prototype.getWord = function() {
  return this.lSystem.word;
};

Plant.prototype.step = function() {
  this.lSystem.step();
};

Plant.prototype.draw = function(word, dt) {
  var drawFn = (typeof dt !== 'undefined') ? 'animate' : 'draw'
  this.turtle[drawFn](word || this.lSystem.word, dt);
};

module.exports = Plant;
},{"./LSystem":1,"./Turtle":3,"./util":5}],3:[function(require,module,exports){
var TURTLE_ACTIONS = {
  LEFT: 'turnLeft',
  RIGHT: 'turnRight',
  FORWARD: 'drawForward',
  PUSH: 'push',
  POP: 'pop'
};

// A simple Turtle drawer
// svg is an svg DOM node
// dXY is the distance/radius of each step
// dTh is the change in angle when turning
// rules look like: { a: TURTLE_ACTIONS.LEFT, b: [TURTLE_ACTIONS.RIGHT, TURTLE_ACTIONS.FORWARD] }
function Turtle(svg, dXY, dTh, rules) {
  this.svg = svg;
  this.dXY = dXY;
  this.dTh = dTh;
  this.rules = rules;

  this.path = '';
  this.stateStack = [];
  this.clearState();
}

// TURTLE ACTIONS ///////////////////////////////////////////////
Turtle.prototype[TURTLE_ACTIONS.LEFT] = function() {
  this.theta += this.dTh;
};

Turtle.prototype[TURTLE_ACTIONS.RIGHT] = function() {
  this.theta -= this.dTh;
};

Turtle.prototype[TURTLE_ACTIONS.FORWARD] = function() {
  var dx = this.dXY * Math.cos(this.theta);
  var dy = this.dXY * Math.sin(this.theta);
  this.x += dx;
  this.y += dy;
  this.catPath('l', dx, dy);
};

Turtle.prototype[TURTLE_ACTIONS.PUSH] = function() {
  this.stateStack.push(this.getState());
};

Turtle.prototype[TURTLE_ACTIONS.POP] = function() {
  this.setState(this.stateStack.pop());
};
//////////////////////////////////////////////////////////////////

Turtle.prototype.doAction = function(letter) {
  var action = this.rules[letter];
  if (!action) return;

  if (Array.isArray(action)) {
    for (var i = 0; i < action.length; i++) {
      this[action[i]]();
    }
  } else {
    this[action]();
  }
};

Turtle.prototype.catPath = function(op, x, y) {
  this.path += op + x + ' ' + y;
};

Turtle.prototype.getState = function() {
  return {
    x: this.x,
    y: this.y,
    theta: this.theta,
  };
};

Turtle.prototype.setState = function(state) {
  this.x = state.x;
  this.y = state.y;
  this.theta = state.theta;
  this.catPath('M', this.x, this.y);
};

// TODO: take in init cond.s
Turtle.prototype.clearState = function() {
  this.path = '';
  this.setState({
    x: 5,
    y: 0,
    theta: Math.PI / 2,
  });
};

function getBounds() {
  return {
    maxX: -Infinity,
    maxY: -Infinity,
    minX: Infinity,
    minY: Infinity
  };
}

Turtle.prototype.checkBounds = function(bounds) {
  bounds.maxX = Math.max(bounds.maxX, this.x);
  bounds.maxY = Math.max(bounds.maxY, this.y);
  bounds.minX = Math.min(bounds.minX, this.x);
  bounds.minY = Math.min(bounds.minY, this.y);
};

Turtle.prototype.render = function(bounds) {
  this.svg.innerHTML = '<path d="' + this.path + '" fill="transparent" stroke="black" stroke-width="0.1"/>';
  this.svg.setAttribute('viewBox', bounds.minX + ' ' + bounds.minY + ' ' + (bounds.maxX - bounds.minX) + ' ' + (bounds.maxY - bounds.minY));
};

Turtle.prototype.draw = function(word) {
  var bounds = getBounds();

  this.clearState();
  for (var i = 0; i < word.length; i++) {
    var letter = word[i];
    this.doAction(letter)
    this.checkBounds(bounds);
  }

  this.render(bounds);
};

Turtle.prototype.animate = function(word, drawStepMs) {
  drawStepMs = drawStepMs || 0;
  var bounds = getBounds();
  var start, i = 0;

  function drawLetter(time) {
    if (!start || (time - start) >= drawStepMs) {
      start = time;
      var letter = word[i++];
      this.doAction(letter);
      this.checkBounds(bounds);
      this.render(bounds);
    }

    if (i < word.length) {
      requestAnimationFrame(drawLetter.bind(this));
    }
  }

  this.clearState();
  requestAnimationFrame(drawLetter.bind(this));
};

Turtle.ACTIONS = TURTLE_ACTIONS;

module.exports = Turtle;
},{}],4:[function(require,module,exports){
var TURTLE_ACTIONS = require('./Turtle').ACTIONS;
var LSystemRule = require('./LSystem').Rule;
var Plant = require('./Plant');

var PI = Math.PI;

var svgs = document.getElementsByTagName('svg');
var svgInd = 0;


// PLANTS ///////////////////////////////////////////////
var plants = [];

// pythagoras
plants.push(new Plant(svgs[svgInd++], {
  axiom: '0',
  productions: {
    '0': '1[0]0',
    '1': '11'
  },
  rules: {
    '0': TURTLE_ACTIONS.FORWARD,
    '1': TURTLE_ACTIONS.FORWARD,
    '[': [TURTLE_ACTIONS.PUSH, TURTLE_ACTIONS.LEFT],
    ']': [TURTLE_ACTIONS.POP, TURTLE_ACTIONS.RIGHT]
  },
  dTheta: PI / 4
}));

// serpinski
plants.push(new Plant(svgs[svgInd++], {
  axiom: 'F-G-G',
  productions: {
    'F': 'F-G+F+G-F',
    'G': 'GG'
  },
  rules: {
    'F': TURTLE_ACTIONS.FORWARD,
    'G': TURTLE_ACTIONS.FORWARD,
    '+': TURTLE_ACTIONS.LEFT,
    '-': TURTLE_ACTIONS.RIGHT
  },
  dTheta: 2 * PI / 3
}));

// Dragon
plants.push(new Plant(svgs[svgInd++], {
  axiom: 'F-F-F-F',
  productions: {
  'F': 'F-FF--F-F'
  }
}));

// Box
plants.push(new Plant(svgs[svgInd++], {
  axiom: 'F-F-F-F',
  productions: {
    'F': 'FF-F-F-F-FF'
  }
}));

// Hilbert
plants.push(new Plant(svgs[svgInd++], {
  axiom: 'L',
  productions: {
  'L': '+RF-LFL-FR+',
  'R': '-LF+RFR+FL-'
  }
}));

// Plant
plants.push(new Plant(svgs[svgInd++], {
  axiom: 'X',
  productions: {
    'X': 'F[+X]F[-X]+X',
    'F': 'FF'
  },
  dTheta: PI / 9
}));


var STOC_TEST_RULES = {
  'F': [
    new LSystemRule('F[+F]F[-F]F', { prob: 33 }),
    new LSystemRule('F[+F]F', { prob: 33 }),
    new LSystemRule('F[-F]F', { prob: 34 })
  ]
};
// Stoc test 1
plants.push(new Plant(svgs[svgInd++], {
  axiom: 'F',
  productions: STOC_TEST_RULES,
  dTheta: 27.5 * PI / 180
}));
// Stoc test 2
plants.push(new Plant(svgs[svgInd++], {
  axiom: 'F',
  productions: STOC_TEST_RULES,
  dTheta: 27.5 * PI / 180
}));

var CONTEXT_RULES = {
  '0': [
    new LSystemRule('1', { lContext: '0', rContext: '0' }),
    new LSystemRule('0', { lContext: '0', rContext: '1' }),
    new LSystemRule('1', { lContext: '1', rContext: '0' }),
    new LSystemRule('1[+F1F1]', { lContext: '1', rContext: '1' })
  ],
  '1': [
    new LSystemRule('0', { lContext: '0', rContext: '0' }),
    new LSystemRule('1F1', { lContext: '0', rContext: '1' }),
    new LSystemRule('1', { lContext: '1', rContext: '0' }),
    new LSystemRule('0', { lContext: '1', rContext: '1' })
  ],
  '+': '-',
  '-': '+'
};
// Context test
plants.push(new Plant(svgs[svgInd++], {
  axiom: 'F0F1F1',
  productions: CONTEXT_RULES,
  context: '01',
  dTheta: 27.5 * PI / 180
}));


// //Ethan test
// var wide = {
//   'F': [
//     new LSystemRule('F[+F][-F]F[F+F]', { prob: 50 }),
//     new LSystemRule('F[+F]F[-F]', { prob: 50 }),
//   ]
// };

// var narrow = {
//   'F': [
//     new LSystemRule('F-F[+F]F+FF', { prob: 50 }),
//     new LSystemRule('F+FF-F[-F]FF', { prob: 50 }),
//   ]
// };

// plants.push(new Plant(svgs[svgInd++], {
//   axiom: 'F',
//   productions: wide,
//   dTheta: 27.5 * PI / 180
// }));

// plants.push(new Plant(svgs[svgInd++], {
//   axiom: 'F',
//   productions: narrow,
//   dTheta: 27.5 * PI / 180
// }));

plants.push(Plant.seed(svgs[svgInd++], plants));


// STEP AND DRAW //////////////////////////////////////////
// Draw after each step
function stepAndDraw(n, stepTimeMs) {
  var wordHistory = [];

  var steps = 0;
  function step(time) {
    for (var i = 0; i < plants.length; i++) {
      plants[i].step();
    }

    wordHistory.push(plants.map(function(p) { return p.getWord(); }));

    if (++steps < n) {
      setTimeout(step, 0.0);
    }
  }

  var start;
  function draw(time) {
    // If we have words to draw, and either
    // this is the first frame or enough time
    // has elapsed since the last frame, DRAW
    if (wordHistory.length && (!start || (time - start) >= stepTimeMs)) {
      var words = wordHistory.shift();
      for (var i = 0; i < plants.length; i++) {
        plants[i].draw(words[i]);
      }

      start = time;
    }

    requestAnimationFrame(draw)
  }

  setTimeout(step, 0.0);
  requestAnimationFrame(draw);
}


// Step all the way then draw
function stepThenDraw(n, drawStepMs) {
  for (var i = 0; i < n; i++) {
    for (var j = 0; j < plants.length; j++) {
      plants[j].step();
    }
  }
  for (var j = 0; j < plants.length; j++) {
    plants[j].draw(null, drawStepMs);
  }
}


// stepAndDraw(6, 100);
stepThenDraw(6, true, 0);
// stepThenDraw(6);

},{"./LSystem":1,"./Plant":2,"./Turtle":3}],5:[function(require,module,exports){
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
},{}]},{},[4]);
