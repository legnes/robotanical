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

Turtle.prototype.draw = function(word) {
  var maxX = maxY = -Infinity;
  var minX = minY = Infinity;

  function checkBounds() {
    maxX = Math.max(maxX, this.x);
    maxY = Math.max(maxY, this.y);
    minX = Math.min(minX, this.x);
    minY = Math.min(minY, this.y);
  }

  this.clearState();
  for (var i = 0; i < word.length; i++) {
    var letter = word[i];
    var op = this.rules[letter];
    if (!op) continue;

    if (Array.isArray(op)) {
      for (var j = 0; j < op.length; j++) {
        this[op[j]]();
      }
    } else {
      this[op]();
    }

    checkBounds.call(this);
  }

  this.svg.innerHTML = '<path d="' + this.path + '" fill="transparent" stroke="black" stroke-width="0.1"/>';
  this.svg.setAttribute('viewBox', minX + ' ' + minY + ' ' + (maxX - minX) + ' ' + (maxY - minY));
};

Turtle.TURTLE_ACTIONS = TURTLE_ACTIONS;

module.exports = Turtle;