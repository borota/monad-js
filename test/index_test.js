const test = require('assert');
const sut = require('../build/monad-js');

class CustomError extends Error {
  constructor(...params) {
    super(...params);
    Error.captureStackTrace(this, CustomError);
  }
}

describe('Maybe monad', () => {
  it('Guarded null', () => {
    const monad = sut.maybe(null);
    test.strictEqual(monad.isNull, true, 'isNull set');
    monad.bind(() => {
      throw new Error('Bound function called when null?');
    });
    monad.bind(global.console.log); // no exception, nothing logged
  });
  it('Guarded not null', () => {
    const text = 'Hi there!';
    const monad = sut.maybe(text);
    test.throws(() => {
      monad.bind(value => {
        test.strictEqual(value, text, 'monad has value');
        throw new CustomError('Bound ran');
      });
    }, CustomError);
  });
});
describe('Identity monad', () => {
  it('Identity test', () => {
    const text = 'Hi there!';
    const monad = sut.identity(text);
    test.throws(() => {
      monad.bind(value => {
        test.strictEqual(value, text, 'identity verifies');
        throw new CustomError('Bound ran');
      });
    }, CustomError);
  });
  it('Identity method', () => {
    const text = 'Hi there!';
    const method = sut.identity.method('show', x => x);
    test.strictEqual(method, sut.identity, 'unit returned');
    const monad = sut.identity(text);
    const result = monad.show(2);
    test.strictEqual(result, 2, 'method verifies');
    test.throws(() => {
      monad.bind(value => {
        test.strictEqual(value, text, 'identity verifies');
        throw new CustomError('Bound ran');
      });
    }, CustomError);
  });
  it('Identity liftValue', () => {
    const text = 'Hi there!';
    const { identity } = sut;
    const liftValue = identity.liftValue('show', x => x);
    test.strictEqual(liftValue, sut.identity, 'unit returned');
    const monad = identity(text);
    const result = monad.show(2);
    test.strictEqual(result, text, 'liftValue verifies');
  });
  it('Identity lift with value', () => {
    test.throws(() => {
      const text = 'Hi there!';
      const { identity } = sut;
      identity.lift('show', x => x);
      const monad = identity(text);
      monad.show(2).bind(value => {
        test.strictEqual(value, text, 'lift verifies');
        throw new CustomError('Bound ran');
      });
    }, CustomError);
  });
  it('Identity lift with monad', () => {
    test.throws(() => {
      const text = 'Hi there!';
      const { identity } = sut;
      identity.lift('show', x => sut.maybe(x));
      const monad = identity(text);
      monad.show(5).bind(value => {
        test.strictEqual(value, text, 'lift with monad verifies');
        throw new CustomError('Bound ran');
      });
    }, CustomError);
  });
});
