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





// DEFINE L-SYSTEMS AND TURTLES
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
var dragonTurtle = new Turtle(svgs[svgInd++], 1, Math.PI/2, LINDENMAYER_TURTLE_RULES);

var box = new LSystem('F-F-F-F', {
  'F': 'FF-F-F-F-FF'
});
var boxTurtle = new Turtle(svgs[svgInd++], 1, Math.PI/2, LINDENMAYER_TURTLE_RULES);

var hilbert = new LSystem('L', {
  'L': '+RF-LFL-FR+',
  'R': '-LF+RFR+FL-'
});
var hilbertTurtle = new Turtle(svgs[svgInd++], 1, Math.PI/2, LINDENMAYER_TURTLE_RULES);

var plant = new LSystem('X', {
  'X': 'F[+X]F[-X]+X',
  'F': 'FF'
});
var plantTurtle = new Turtle(svgs[svgInd++], 1, Math.PI/9, LINDENMAYER_TURTLE_RULES);

var STOC_TEST_RULES = {
  'F': [
    new LSystem.StochasticRule('F[+F]F[-F]F', 33),
    new LSystem.StochasticRule('F[+F]F', 33),
    new LSystem.StochasticRule('F[-F]F', 34)
  ]
};
var stoc1 = new LSystem('F', STOC_TEST_RULES);
var stoc1Turtle = new Turtle(svgs[svgInd++], 1, 27.5*Math.PI/180, LINDENMAYER_TURTLE_RULES);

var stoc2 = new LSystem('F', STOC_TEST_RULES);
var stoc2Turtle = new Turtle(svgs[svgInd++], 1, 27.5*Math.PI/180, LINDENMAYER_TURTLE_RULES);





// STEP AND DRAW
for (var i = 0; i < 7; i++) {
  pythagoras.step();
  serpinski.step();
  dragon.step();
  box.step();
  hilbert.step();
  plant.step();
  stoc1.step();
  stoc2.step();
}

pythagorasTurtle.draw(pythagoras.word);
serpinskiTurtle.draw(serpinski.word);
dragonTurtle.draw(dragon.word);
boxTurtle.draw(box.word);
hilbertTurtle.draw(hilbert.word);
plantTurtle.draw(plant.word);
stoc1Turtle.draw(stoc1.word);
stoc2Turtle.draw(stoc2.word);
