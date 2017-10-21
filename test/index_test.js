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
describe('Identity monad', () => {
  let content = '';
  const setContent = x => {
    content = x;
  };
  const identity = sut.makeMonad();
  const msg = 'Hello world.';
  const monad = identity(msg);
  monad.bind(setContent);
  it('Identity test', () => {
    test.strictEqual(content, msg, 'identity verifies');
  });
});
