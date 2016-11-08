var LSystem = require('./LSystem');
var Turtle = require('./Turtle');

var TURTLE_ACTIONS = Turtle.TURTLE_ACTIONS;
var PI = Math.PI;

var LINDENMAYER_TURTLE_RULES = {
  'F': TURTLE_ACTIONS.FORWARD,
  '-': TURTLE_ACTIONS.RIGHT,
  '+': TURTLE_ACTIONS.LEFT,
  '[': TURTLE_ACTIONS.PUSH,
  ']': TURTLE_ACTIONS.POP
};

var svgs = document.getElementsByTagName('svg');
var svgInd = 0;





// DEFINE L-SYSTEMS AND TURTLES ////////////////////////////////////
// To make sure your new lsystem + turtle gets drawn, add it to:
//  - getWords()
//  - step() and draw() in stepAndDraw()
//  - stepThenDraw() x2

var pythagoras = new LSystem('0', {
  '0': '1[0]0',
  '1': '11'
});
var pythagorasTurtle = new Turtle(svgs[svgInd++], 1, PI/4, {
  '0': TURTLE_ACTIONS.FORWARD,
  '1': TURTLE_ACTIONS.FORWARD,
  '[': [TURTLE_ACTIONS.PUSH, TURTLE_ACTIONS.LEFT],
  ']': [TURTLE_ACTIONS.POP, TURTLE_ACTIONS.RIGHT]
});

var serpinski = new LSystem('F-G-G', {
  'F': 'F-G+F+G-F',
  'G': 'GG'
});
var serpinskiTurtle = new Turtle(svgs[svgInd++], 1, 2*PI/3, {
  'F': TURTLE_ACTIONS.FORWARD,
  'G': TURTLE_ACTIONS.FORWARD,
  '+': TURTLE_ACTIONS.LEFT,
  '-': TURTLE_ACTIONS.RIGHT
});

var dragon = new LSystem('F-F-F-F', {
  'F': 'F-FF--F-F'
});
var dragonTurtle = new Turtle(svgs[svgInd++], 1, PI/2, LINDENMAYER_TURTLE_RULES);

var box = new LSystem('F-F-F-F', {
  'F': 'FF-F-F-F-FF'
});
var boxTurtle = new Turtle(svgs[svgInd++], 1, PI/2, LINDENMAYER_TURTLE_RULES);

var hilbert = new LSystem('L', {
  'L': '+RF-LFL-FR+',
  'R': '-LF+RFR+FL-'
});
var hilbertTurtle = new Turtle(svgs[svgInd++], 1, PI/2, LINDENMAYER_TURTLE_RULES);

var plant = new LSystem('X', {
  'X': 'F[+X]F[-X]+X',
  'F': 'FF'
});
var plantTurtle = new Turtle(svgs[svgInd++], 1, PI/9, LINDENMAYER_TURTLE_RULES);

var STOC_TEST_RULES = {
  'F': [
    new LSystem.Rule('F[+F]F[-F]F', { prob: 33 }),
    new LSystem.Rule('F[+F]F', { prob: 33 }),
    new LSystem.Rule('F[-F]F', { prob: 34 })
  ]
};
var stoc1 = new LSystem('F', STOC_TEST_RULES);
var stoc1Turtle = new Turtle(svgs[svgInd++], 1, 27.5*PI/180, LINDENMAYER_TURTLE_RULES);

var stoc2 = new LSystem('F', STOC_TEST_RULES);
var stoc2Turtle = new Turtle(svgs[svgInd++], 1, 27.5*PI/180, LINDENMAYER_TURTLE_RULES);

var context = new LSystem('F0F1F1', {
  '0': [
    new LSystem.Rule('1', { lContext: '0', rContext: '0' }),
    new LSystem.Rule('0', { lContext: '0', rContext: '1' }),
    new LSystem.Rule('1', { lContext: '1', rContext: '0' }),
    new LSystem.Rule('1[+F1F1]', { lContext: '1', rContext: '1' })
  ],
  '1': [
    new LSystem.Rule('0', { lContext: '0', rContext: '0' }),
    new LSystem.Rule('1F1', { lContext: '0', rContext: '1' }),
    new LSystem.Rule('1', { lContext: '1', rContext: '0' }),
    new LSystem.Rule('0', { lContext: '1', rContext: '1' })
  ],
  '+': '-',
  '-': '+'
}, '01');
var contextTurtle = new Turtle(svgs[svgInd++], 1, 27.5*PI/180, LINDENMAYER_TURTLE_RULES);

function getWords() {
  return {
    pythagoras: pythagoras.word,
    serpinski: serpinski.word,
    dragon: dragon.word,
    box: box.word,
    hilbert: hilbert.word,
    plant: plant.word,
    stoc1: stoc1.word,
    stoc2: stoc2.word,
    context: context.word
  };
}





// STEP AND DRAW //////////////////////////////////////////
// Draw after each step
function stepAndDraw(n, stepTimeMs) {
  var wordHistory = [];

  var steps = 0;
  function step(time) {
    pythagoras.step();
    serpinski.step();
    dragon.step();
    box.step();
    hilbert.step();
    plant.step();
    stoc1.step();
    stoc2.step();
    context.step();
    wordHistory.push(getWords());

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

      pythagorasTurtle.draw(words.pythagoras);
      serpinskiTurtle.draw(words.serpinski);
      dragonTurtle.draw(words.dragon);
      boxTurtle.draw(words.box);
      hilbertTurtle.draw(words.hilbert);
      plantTurtle.draw(words.plant);
      stoc1Turtle.draw(words.stoc1);
      stoc2Turtle.draw(words.stoc2);
      contextTurtle.draw(words.context);

      start = time;
    }

    requestAnimationFrame(draw)
  }

  setTimeout(step, 0.0);
  requestAnimationFrame(draw);
}


// Step all the way then draw
function stepThenDraw(n, animate, drawStepMs) {
  for (var i = 0; i < n; i++) {
    pythagoras.step();
    serpinski.step();
    dragon.step();
    box.step();
    hilbert.step();
    plant.step();
    stoc1.step();
    stoc2.step();
    context.step();
  }

  var drawFn = animate ? 'animate' : 'draw';
  pythagorasTurtle[drawFn](pythagoras.word, drawStepMs);
  serpinskiTurtle[drawFn](serpinski.word, drawStepMs);
  dragonTurtle[drawFn](dragon.word, drawStepMs);
  boxTurtle[drawFn](box.word, drawStepMs);
  hilbertTurtle[drawFn](hilbert.word, drawStepMs);
  plantTurtle[drawFn](plant.word, drawStepMs);
  stoc1Turtle[drawFn](stoc1.word, drawStepMs);
  stoc2Turtle[drawFn](stoc2.word, drawStepMs);
  contextTurtle[drawFn](context.word, drawStepMs);
}


stepThenDraw(6);
// stepThenDraw(6, true, 0);
// stepAndDraw(6, 100);
