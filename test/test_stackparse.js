var assert = require('chai').assert;
var _      = require('underscore');

var stack_parse = require('../stackparse');


const eg = [
  { source: 'Chrome console',
    stack: `Error
    at <anonymous>:1:5`,
    expected: {
      "objectName": null,
      "fileName": "<anonymous>",
      "lineNumber": 1,
      "columnNumber": 5
    }
  },
  { source: 'Node.js running err.js',
    stack: `Error
    at Object.<anonymous> (/Users/jeunice/pytest/testing/err.js:3:10)
    at Module._compile (module.js:570:32)
    at Object.Module._extensions..js (module.js:579:10)
    at Module.load (module.js:487:32)
    at tryModuleLoad (module.js:446:12)
    at Function.Module._load (module.js:438:3)
    at Module.runMain (module.js:604:10)
    at run (bootstrap_node.js:394:7)
    at startup (bootstrap_node.js:149:9)
    at bootstrap_node.js:509:3`,
    expected: {
      "objectName": "Object.<anonymous>",
      "fileName": "/Users/jeunice/pytest/testing/err.js",
      "lineNumber": 3,
      "columnNumber": 10
    }
  },
  { source: 'Node.js from within function f',
    stack: `Error
    at f (/Users/jeunice/pytest/testing/err.js:4:10)
    at Object.<anonymous> (/Users/jeunice/pytest/testing/err.js:9:1)
    at Module._compile (module.js:570:32)
    at Object.Module._extensions..js (module.js:579:10)
    at Module.load (module.js:487:32)
    at tryModuleLoad (module.js:446:12)
    at Function.Module._load (module.js:438:3)
    at Module.runMain (module.js:604:10)
    at run (bootstrap_node.js:394:7)
    at startup (bootstrap_node.js:149:9)`,
    expected: {
      "objectName": "f",
      "fileName": "/Users/jeunice/pytest/testing/err.js",
      "lineNumber": 4,
      "columnNumber": 10
    }
  },
  { source: 'Node.js repl',
    stack: `ReferenceError: sdlfjs is not defined
    at repl:1:1
    at sigintHandlersWrap (vm.js:22:35)
    at sigintHandlersWrap (vm.js:96:12)
    at ContextifyScript.Script.runInThisContext (vm.js:21:12)
    at REPLServer.defaultEval (repl.js:313:29)
    at bound (domain.js:280:14)
    at REPLServer.runBound [as eval] (domain.js:293:12)
    at REPLServer.<anonymous> (repl.js:513:10)
    at emitOne (events.js:101:20)
    at REPLServer.emit (events.js:188:7)`,
    expected: {
      "objectName": null,
      "fileName": "repl",
      "lineNumber": 1,
      "columnNumber": 1
    }
  }
]

describe('stackparse', function() {
  eg.forEach(ex => {
    it('should parse STs from ' + ex.source, function(){
      assert.deepEqual(stack_parse(ex.stack), ex.expected);
    });
  });
});
