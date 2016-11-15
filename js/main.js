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
// stepThenDraw(6, true, 0);
stepThenDraw(6);
