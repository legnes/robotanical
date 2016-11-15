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