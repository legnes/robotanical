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