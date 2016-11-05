var LSystem = require('./LSystem');

var pythagoras = new LSystem('0', { '1': '11', '0': '1[0]0' });
console.log(pythagoras.word);

for (var i = 0; i < 10; i++) {
  pythagoras.step();
  console.log(pythagoras.word);
}