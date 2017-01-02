var assert = require('chai').assert;
var _      = require('underscore');
var stdout = require("test-console").stdout;

var logging = require('../logging');



describe('cl', function() {
  it('should print to console', function(){
    var output = stdout.inspectSync(function() {
        cl("foo");
    });
    assert.deepEqual(output, ['foo\n']);
  });
});


describe('dcl', function() {
  it('should NOT print to console', function(){
    var output = stdout.inspectSync(function() {
        dcl("foo");
    });
    assert.deepEqual(output, []);
  });
});


describe('repr', function() {

  it('should JSON.stringify', function(){
    var obj = { x: 1, y: 'b' };
    assert.equal(repr(obj), JSON.stringify(obj));
  });

});


describe('reprp', function() {

  it('should JSON.stringify indented', function(){
    var obj = { x: 1, y: 'b' };
    assert.equal(reprp(obj), JSON.stringify(obj, null, '  '));
  });

});
