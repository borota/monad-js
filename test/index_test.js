const test = require('assert');
const sut = require('../build/monad-js');

describe('Maybe monad', () => {
  it('Guarded null', () => {
    const monad = sut.maybe(null);
    monad.bind(global.console.log); // no exception, nothing logged
    test.strictEqual(monad.isNull, true, 'isNull set');
  });
  it('Guarded not null', () => {
    const text = 'Hi there!';
    const monad = sut.maybe(text);
    let content = '';
    const setContent = x => {
      content = x;
    };
    monad.bind(setContent); // content will be set to Hi There!
    test.strictEqual(content, text, 'monad has value');
  });
});
