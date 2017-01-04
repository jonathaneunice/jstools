
// https://github.com/node-js-libs/load.js
// bundled wholesale

/* Copyright (c) 2010 Chris O'Hara <cohara87@gmail.com>. MIT Licensed */

//Include the chain.js microframework (http://github.com/chriso/chain.js)
(function(a){a=a||{};var b={},c,d;c=function(a,d,e){var f=a.halt=!1;a.error=function(a){throw a},a.next=function(c){c&&(f=!1);if(!a.halt&&d&&d.length){var e=d.shift(),g=e.shift();f=!0;try{b[g].apply(a,[e,e.length,g])}catch(h){a.error(h)}}return a};for(var g in b){if(typeof a[g]==="function")continue;(function(e){a[e]=function(){var g=Array.prototype.slice.call(arguments);if(e==="onError"){if(d){b.onError.apply(a,[g,g.length]);return a}var h={};b.onError.apply(h,[g,g.length]);return c(h,null,"onError")}g.unshift(e);if(!d)return c({},[g],e);a.then=a[e],d.push(g);return f?a:a.next()}})(g)}e&&(a.then=a[e]),a.call=function(b,c){c.unshift(b),d.unshift(c),a.next(!0)};return a.next()},d=a.addMethod=function(d){var e=Array.prototype.slice.call(arguments),f=e.pop();for(var g=0,h=e.length;g<h;g++)typeof e[g]==="string"&&(b[e[g]]=f);--h||(b["then"+d.substr(0,1).toUpperCase()+d.substr(1)]=f),c(a)},d("chain",function(a){var b=this,c=function(){if(!b.halt){if(!a.length)return b.next(!0);try{null!=a.shift().call(b,c,b.error)&&c()}catch(d){b.error(d)}}};c()}),d("run",function(a,b){var c=this,d=function(){c.halt||--b||c.next(!0)},e=function(a){c.error(a)};for(var f=0,g=b;!c.halt&&f<g;f++)null!=a[f].call(c,d,e)&&d()}),d("defer",function(a){var b=this;setTimeout(function(){b.next(!0)},a.shift())}),d("onError",function(a,b){var c=this;this.error=function(d){c.halt=!0;for(var e=0;e<b;e++)a[e].call(c,d)}})})(this);

var head = document.getElementsByTagName('head')[0] || document.documentElement;

addMethod('load', function (args, argc) {
    for (var queue = [], i = 0; i < argc; i++) {
        (function (i) {
            queue.push(asyncLoadScript(args[i]));
        }(i));
    }
    this.call('run', queue);
});

function asyncLoadScript(src) {
    return function (onload, onerror) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = src;
        script.onload = onload;
        script.onerror = onerror;
        script.onreadystatechange = function () {
            var state = this.readyState;
            if (state === 'loaded' || state === 'complete') {
                script.onreadystatechange = null;
                onload();
            }
        };
        head.insertBefore(script, head.firstChild);
    }
}


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


var sho_where = true;
var _lp_div = null;
var _line_offset = 0;
var emit = prep_emit();
var BR;

function start_sho(offset) {
  if (offset === true) {
    var e = new Error();
    _cl('e.stack', e.stack);
    var where = stack_parse(e.stack, 2);
    _line_offset = where.lineNumber;
    _cl('lineNumber', lineNumber);
  }
  var dashes = "-------";
  var now = new Date();
  var parts = [dashes, now.toLocaleString(), dashes];
  var msg = parts.join(' ');
  emit(msg);
}
var _start_sho = start_sho;

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
    var shortName = where.fileName.match(/^.*\/(.*)$/)[1];
    return shortName + ':' + lineNo;
  }
}

function sho() {
  var args = Array.prototype.slice.call(arguments);
  if (sho_where) {
    args.splice(0, 0, wherefrom());
  }
  emit.apply(null, args);
}

function shor() {
  var args = Array.prototype.slice.call(arguments);
  var runningLength = 0;
  var outargs = [];
  if (args.length) {
    for (var i=0; i<args.length; i++) {
      var a = args[i];
      var r;
      if (i === 0) {
        var t = typeof a;
        if (t === 'string') {
          r = a;
        } else if (t === 'object') {
          r = Object.keys(a)
                    .map(k => `${k}: ${repr(a[k])}`)
                    .join(', ');
        }
        else {
          r = repr(r);
        }
      } else {
        r = repr(r);
      }
      outargs.push(r);
    }
  }
  if (sho_where) {
    outargs.splice(0, 0, wherefrom());
  }
  emit.apply(null, outargs);
}

var nosho = dcl; // show nothing
var _shor = shor;
var _noshor = dcl;
var _sho = sho;
var _nosho = nosho;

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
    font-size: 14px;
    color: blue;
    font-family: "Lucida Console", sans-serif;
    font-weight: normal;
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
  _cl: _cl,
  _dcl: _dcl,
  cl: cl,
  dcl: dcl,
  repr: repr,
  reprp: reprp,
  sho: sho,
  nosho: nosho,
  rounder: rounder,
  props: props,
  propvals: propvals,
  keys: keys,
  lib: lib,
  load: load
};

// globalize these functions
if (typeof window !== "undefined") {
  global = window;
}
for (p in exports) {
  global[p] = exports[p];
}
