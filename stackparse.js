

/**
 * Lightweight parser of JS stack traces.
 */

function stack_parse(s) {
  var lines = s.split('\n');
  var lineRE = /at (.*):(\d+):(\d+)/;
  var [_na, pre, lineno, colno] = lines[1].match(lineRE);
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


exports = module.exports = stack_parse;
