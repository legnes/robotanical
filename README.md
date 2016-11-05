ProcJam 2016  
Ethan Edwards and Sam Engel 
  

To build the bundle:
```
$ browserify js/main.js -o static/bundle.js  
```
To automatically build the bundle on save:
```
$ watchify js/main.js -o static/bundle.js  
```
To run watchify in the background:
```
$ watchify js/main.js -o static/bundle.js &  
```
