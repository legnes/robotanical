var LSystem = require('./LSystem');
var Turtle = require('./Turtle');

var TURTLE_ACTIONS = Turtle.TURTLE_ACTIONS;
var PI = Math.PI;

// SETUP
var svgs = document.getElementsByTagName('svg');


// DEFINE L-SYSTEMS AND TURTLES
var pythagoras = new LSystem('0', {
  '0': '1[0]0',
  '1': '11'
});
var pythagorasTurtle = new Turtle(svgs[0], 1, PI/4, {
  '0': TURTLE_ACTIONS.FORWARD,
  '1': TURTLE_ACTIONS.FORWARD,
  '[': [TURTLE_ACTIONS.PUSH, TURTLE_ACTIONS.LEFT],
  ']': [TURTLE_ACTIONS.POP, TURTLE_ACTIONS.RIGHT]
});

var serpinski = new LSystem('F-G-G', {
  'F': 'F-G+F+G-F',
  'G': 'GG'
});
var serpinskiTurtle = new Turtle(svgs[1], 1, 2*PI/3, {
  'F': TURTLE_ACTIONS.FORWARD,
  'G': TURTLE_ACTIONS.FORWARD,
  '+': TURTLE_ACTIONS.LEFT,
  '-': TURTLE_ACTIONS.RIGHT
});

var dragon = new LSystem('F-F-F-F', {
  'F': 'F-FF--F-F'
});
var dragonTurtle = new Turtle(svgs[2], 1, Math.PI / 2, {
  'F': TURTLE_ACTIONS.FORWARD,
  '-': TURTLE_ACTIONS.RIGHT
});

var box = new LSystem('F-F-F-F', {
  'F': 'FF-F-F-F-FF'
});
var boxTurtle = new Turtle(svgs[3], 1, Math.PI / 2, {
  'F': TURTLE_ACTIONS.FORWARD,
  '-': TURTLE_ACTIONS.LEFT
});


// STEP AND DRAW
for (var i = 0; i < 7; i++) {
  pythagoras.step();
  serpinski.step();
  dragon.step();
  box.step();
}

pythagorasTurtle.draw(pythagoras.word);
serpinskiTurtle.draw(serpinski.word);
dragonTurtle.draw(dragon.word);
boxTurtle.draw(box.word);
