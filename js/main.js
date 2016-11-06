var LSystem = require('./LSystem');
var Turtle = require('./Turtle');

var TURTLE_ACTIONS = Turtle.TURTLE_ACTIONS;
var PI = Math.PI;

// SETUP
var pythSvg = document.getElementById('pythagoras');
var serpSvg = document.getElementById('serpinski');


// DEFINE L-SYSTEMS AND TURTLES
var pythagoras = new LSystem('0', {
  '0': '1[0]0',
  '1': '11'
});
var pythagorasTurtle = new Turtle(pythSvg, 1, PI/4, {
  '0': TURTLE_ACTIONS.FORWARD,
  '1': TURTLE_ACTIONS.FORWARD,
  '[': [TURTLE_ACTIONS.PUSH, TURTLE_ACTIONS.LEFT],
  ']': [TURTLE_ACTIONS.POP, TURTLE_ACTIONS.RIGHT]
});

var serpinski = new LSystem('F-G-G', {
  'F': 'F-G+F+G-F',
  'G': 'GG'
});
var serpinskiTurtle = new Turtle(serpSvg, 1, 2*PI/3, {
  'F': TURTLE_ACTIONS.FORWARD,
  'G': TURTLE_ACTIONS.FORWARD,
  '+': TURTLE_ACTIONS.LEFT,
  '-': TURTLE_ACTIONS.RIGHT
});


// STEP AND DRAW
console.log('pythagoras:', pythagoras.word);
console.log('serpinski:', serpinski.word);
for (var i = 0; i < 7; i++) {
  pythagoras.step();
  console.log('pythagoras:', pythagoras.word);

  serpinski.step();
  console.log('serpinski', serpinski.word);
}

pythagorasTurtle.draw(pythagoras.word);
serpinskiTurtle.draw(serpinski.word);
