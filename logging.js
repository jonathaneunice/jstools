
// logging helpers
var _cl = console.log;
var _dcl = function(){}; // don't do nuttin

// alternate naming
var cl = _cl;
var dcl = _dcl;

// NB To turn off console logging universally,
// cl = _cl = dcl;
// will do the trick

// stringify objects into representations
// very handy when logging to console
var repr = JSON.stringify;
var reprp = function(x) { return JSON.stringify(x, null, '  '); };


exports = module.exports = {
  _cl: _cl,
  _dcl: _dcl,
  cl: cl,
  dcl: dcl,
  repr: repr,
  reprp: reprp
};

// globalize these functions
if (typeof window !== "undefined") {
  global = window;
}
for (p in exports) {
  global[p] = exports[p];
}
