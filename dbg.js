
// consider bundling
// https://github.com/node-js-libs/load.js


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


var say_where = true;
var _lp_div = null;
var _line_offset = 0;
var emit = prep_emit();
var BR;

function start_run(label) {
  var offset;
  if (offset === true) {
    var e = new Error();
    _cl('e.stack', e.stack);
    var where = stack_parse(e.stack, 2);
    _line_offset = where.lineNumber;
    _cl('lineNumber', lineNumber);
  }
  var dashes = "-------";
  var now = new Date();
  var parts = label ? [ dashes, label, now.toLocaleString(), dashes ]
                    : [ dashes, now.toLocaleString(), dashes ];
  var msg = parts.join(' ');
  emit(msg);
}

function stack_parse(s, lb) {
  var lines = s.split('\n');
  var lineRE = /at (.*):(\d+):(\d+)/;
  var [_na, pre, lineno, colno] = lines[lb].match(lineRE);
  var res = {};
  var parenIndex = pre.indexOf('(');
  if (parenIndex >= 0) {
    res.objectName = pre.slice(0, parenIndex).trim();
    res.fileName = pre.slice(parenIndex+1);
  } else {
    res.objectName = null;
    res.fileName = pre;
  }
  res.lineNumber = +lineno;
  res.columnNumber = +colno;
  return res;
}

function wherefrom() {
  var e = new Error();
  var where = stack_parse(e.stack, 3);
  if (where === null) {
    return '';
  } else {
    var lineNo = where.lineNumber - _line_offset + 1;
    cl(where);
    cl(where.fileName)
    var nameMatch = where.fileName.match(/^.*\/(.*)$/);
    var shortName = nameMatch ? nameMatch[1] : where.fileName;
    var together = shortName + ':' + lineNo;
    if (emit === weblog) {
      return `<span class="lineno">${together}</span>`;
    } else {
      return together;
    }
  }
}

/**
 * Emit some text where. Whether that is emitted to the
 * console or an ouput div depends on where running.
 */
function say() {
  var args = Array.prototype.slice.call(arguments);
  if (say_where) {
    args.splice(0, 0, wherefrom());
  }
  emit.apply(null, args);
}

function show() {
  var args = Array.prototype.slice.call(arguments);
  var runningLength = 0;
  var outargs = [];
  var keyfmt = k => (emit === weblog) ? `<span class="key">${k}</span>` : k;
  var sepfmt = s => (emit === weblog) ? `<span class="sep">${s}</span>` : s;
  if (args.length) {
    for (var i=0; i<args.length; i++) {
      var a = args[i];
      var t = typeof a;
      var r;
      if (i === 0) {
        if (t === 'string') {
          r = a;
        } else if ((t === 'object') && (!Array.isArray(a))) {
          r = Object.keys(a)
                    .map(k => `${keyfmt(k)}${sepfmt(':')} ${repr(a[k])}`)
                    .join(', ');
        }
        else {
          r = repr(a);
        }
      } else {
        r = repr(a);
      }
      outargs.push(r);
    }
  }
  if (say_where) {
    outargs.splice(0, 0, wherefrom());
  }
  emit.apply(null, outargs);
}

var noshow = dcl; // show nothing
var nosay  = dcl;
const yessay = say;  // can always use these to restore showing
const yesshow = show;

/**
 * Convert the the properties of an object
 * into a more easily shown format. Better than
 * Object.keys(o) and Object.getOwnPropertyNames(o)
 * because it looks up the inheritance / prototype
 * chain. Does not show functions, as not
 */
function props(o) {
  var names = [];
  for (var name in o) {
    var val = o[name];
    if (typeof(val) !== "function") names.push(name);
  }
  return names;
}

function propvals(o) {
  var result = {};
  props(o).forEach(function(name){
    result[name] = o[name];
  });
  return result;
}

function keys(o) {
  return Object.keys(o);
}


/**
 * Add an appropriate stylesheet to the document.
 */
function _add_stylesheet() {
  var head = document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = _lp_css;
  } else {
    style.appendChild(document.createTextNode(_lp_css));
  }
  head.appendChild(style);
}

function _establish_div() {
  if (_lp_div) return; // just once
  _lp_div = document.createElement('div');
  _lp_div.setAttribute('id', 'logprint');
  var home = document.querySelector('body');
  home.appendChild(_lp_div);
  _add_stylesheet();
}

function weblog() {
  var args = Array.prototype.slice.call(arguments);
  if (!_lp_div) _establish_div();
  var pNode = document.createElement('p');
  pNode.innerHTML = args.join(' ');
  _lp_div.appendChild(pNode);
}

/**
 * Styles defined here for HTML so as to not require
 * the hassle of a separate stylesheet. All in one!
 */

var _lp_css = `
#logprint {
  border: 1px solid blue;
  padding: 0.1em 0.5em 0.1em 0.5em;
  margin: 6mm 5px 6mm 5px !important;
  max-width: 950px;
}

#logprint > p {
    margin: 10px 0 5px 0;
    font-size: 15pt;
    font-family: "Lucida Console", sans-serif;
    font-weight: normal;
    line-height: 115%;
}

#logprint .lineno {
  color: green;
}

#logprint .key {
  color: blue;
  font-weight: bold;
  background-color: #BEEBFA;
  padding-left: 2px;
  padding-right: 2px;
}
#logprint .sep {
  color: blue;
}
`;

function prep_emit() {
  if (typeof document === "undefined") {
    BR = "\n";
    return console.log;
  }
  else {
    BR = "<br>\n";
    return weblog;
  }
}

/**
 * Heuristic simplifier of numbers for attractive
 * presentation. Integers are returned directly.
 * Floats are rounded to given digits., but with
 * more than one trailing 0 decimal truncated.
 *
 * Note does not stringify, just reduces precision precision.
 * Given the reality of binary floating point, this probably
 * has some ugly edge cases.
 */
function rounder(v, digits) {
  if (digits === undefined) digits = 3;
  if (v === +v) return v;
  var fixed = v.toFixed(lp.precision).replace(/00+$/, '0');
  return +fixed;
}

function lib(name) {
  switch(name) {
    case 'd3':
    case 'd3.v4': return 'https://d3js.org/d3.v4.min.js';
    case 'd3.v3': return 'https://d3js.org/d3.v3.min.js';
    case 'jquery': return 'https://code.jquery.com/jquery-3.1.1.min.js';
    case 'underscore': return 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore-min.js';
  }
}


// export for the node world
if (typeof module === "undefined")
  module = {};

exports = module.exports = {
  cl: cl,
  dcl: dcl,
  repr: repr,
  reprp: reprp,
  say: say,
  show: show,
  nosay: nosay,
  noshow: noshow,
  yessay: yessay,
  yesshow: yesshow,
  rounder: rounder,
  props: props,
  propvals: propvals,
  keys: keys,
  lib: lib,
};

// globalize these functions
if (typeof window !== "undefined") {
  global = window;
}
for (p in exports) {
  global[p] = exports[p];
}
