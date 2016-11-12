var LSystem = require('./LSystem');
var Turtle = require('./Turtle');

var LINDENMAYER_TURTLE_RULES = {
  'F': Turtle.ACTIONS.FORWARD,
  '-': Turtle.ACTIONS.RIGHT,
  '+': Turtle.ACTIONS.LEFT,
  '[': Turtle.ACTIONS.PUSH,
  ']': Turtle.ACTIONS.POP
};

function Plant(svg, opts) {
  this.svg = svg;
  this.lSystem = new LSystem(opts.axiom, opts.productions, opts.context);
  this.turtle = new Turtle(svg,
    opts.dPosition || 1,
    opts.dTheta || Math.PI / 2,
    opts.rules || LINDENMAYER_TURTLE_RULES
  );
}

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