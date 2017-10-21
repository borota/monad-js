/* eslint-disable */
const istanbul = require('istanbul');
const MochaSpecReporter = require('mocha/lib/reporters/spec');

module.exports = function(runner) {
  const collector = new istanbul.Collector();
  const reporter = new istanbul.Reporter();
  reporter.addAll(['lcov', 'json', 'text']);
  new MochaSpecReporter(runner);

  runner.on('end', function() {
    collector.add(global.__coverage__);

    reporter.write(collector, true, function() {
      process.stdout.write('Coverage report generated');
    });
  });
};
