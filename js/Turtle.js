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

Turtle.TURTLE_ACTIONS = TURTLE_ACTIONS;

module.exports = Turtle;