
var fs      = require('fs'),
    path    = require('path'),
    process = require('process');

/**
 * Guess the test directory path. Tests are generally run
 * from either the test dir itself, or the source dir one
 * level above. Guess one of those.
 */
function testDir() {
  var d = process.cwd();
  if (path.basename(d) == "test") return d;
  var dt = path.join(d, "test");
  if (fs.existsSync(dt)) return dt;
  throw new Error("don't know where tests are");
}


/**
 * Run all test_*.js files in the current dir.
 */
function run_available_tests() {
  var testdir = testDir();
  fs.readdirSync(testdir)
    .filter(fn => fn.match(/^test_.*\.js$/))
    .forEach(fn => {
      var testpath = path.join(testdir, fn);
      require(testpath);
    });
}


/**
 * List out source files probably not tested.
 */
function list_untested() {
  var testdir = testDir();
  var sourcedir = path.join(testdir, "..");
  var testnames = fs.readdirSync(testdir)
                    .filter(fn => fn.match(/^test_.*\.js$/))
                    .map(fn => fn.match(/^test_(.*\.js)$/)[1]);
  var untested = fs.readdirSync(sourcedir)
                   .filter(fn => fn.match(/\.js$/))
                   .filter(fn => testnames.indexOf(fn) == -1);
  describe("MODULES SEEMINGLY UNTESTED", function() {
    untested.forEach(u => {
      var srcpath = path.join(sourcedir, u);

      it(u);
      try {
        // try requiring code so that instanbul code coverage
        // tool picks up on it
        require(srcpath);
      } catch(e) {

      }
    });
  });
}

run_available_tests();
list_untested();
