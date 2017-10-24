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
describe('Promise monad', () => {
  it('Vow was kept', done => {
    const vow = sut.vow.make();
    const fate = 'Kept the faith';
    global.setTimeout(() => {
      vow.keep(fate);
    }, 0);
    vow.promise.when(
      value => {
        test.strictEqual(value, fate, 'vow kept');
        done();
      },
      () => {
        throw new Error('Should have never run');
      }
    );
  });
  it('Vow was broken', done => {
    const vow = sut.vow.make();
    const reason = 'Lost the faith';
    global.setTimeout(() => {
      vow.break(reason);
    }, 0);
    vow.promise.when(
      () => {
        throw new Error('Should have never run');
      },
      value => {
        test.strictEqual(value, reason, 'vow broken');
        done();
      }
    );
  });
  it('Every vow kept', done => {
    const vow1 = sut.vow.make();
    const vow2 = sut.vow.make();
    const fate = 'All kept the faith';
    global.setTimeout(() => {
      vow1.keep(fate);
    }, 0);
    global.setTimeout(() => {
      vow2.keep(fate);
    }, 0);
    sut.vow.every([vow1.promise, vow2.promise]).when(
      value => {
        test.strictEqual(value.length, 2, 'results length is 2');
        test.strictEqual(value[0], fate, 'all vows kept');
        done();
      },
      () => {
        throw new Error('Should have never run');
      }
    );
  });
  it('Some vows broken - every check', done => {
    const vow1 = sut.vow.make();
    const vow2 = sut.vow.make();
    const fate = 'Some kept the faith';
    const reason = 'Some lost the faith';
    global.setTimeout(() => {
      vow1.keep(fate);
    }, 0);
    global.setTimeout(() => {
      vow2.break(reason);
    }, 0);
    sut.vow.every([vow1.promise, vow2.promise]).when(
      () => {
        throw new Error('Should have never run');
      },
      value => {
        test.strictEqual(value, reason, 'some vows broken');
        done();
      }
    );
  });
  it('All vows broken - with every check', done => {
    const vow1 = sut.vow.make();
    const vow2 = sut.vow.make();
    const reason = 'Some lost the faith';
    global.setTimeout(() => {
      vow1.break(reason);
    }, 0);
    global.setTimeout(() => {
      vow2.break(reason);
    }, 0);
    sut.vow.every([vow1.promise, vow2.promise]).when(
      () => {
        throw new Error('Should have never run');
      },
      value => {
        test.strictEqual(value, reason, 'all vows broken');
        done();
      }
    );
  });
  it('First kept vow', done => {
    const vow1 = sut.vow.make();
    const vow2 = sut.vow.make();
    const fate = 'Some kept the faith';
    const reason = 'Some lost the faith';
    global.setTimeout(() => {
      vow1.keep(fate);
    }, 0);
    global.setTimeout(() => {
      vow2.break(reason);
    }, 0);
    sut.vow.first([vow1.promise, vow2.promise]).when(
      value => {
        test.strictEqual(value, fate, 'some vows kept');
        done();
      },
      () => {
        throw new Error('Should have never run');
      }
    );
  });
  it('All vows broken - with first check', done => {
    const vow1 = sut.vow.make();
    const vow2 = sut.vow.make();
    const reason = 'Some lost the faith';
    global.setTimeout(() => {
      vow1.break(reason);
    }, 0);
    global.setTimeout(() => {
      vow2.break(reason);
    }, 0);
    sut.vow.first([vow1.promise, vow2.promise]).when(
      () => {
        throw new Error('Should have never run');
      },
      value => {
        test.strictEqual(value, undefined, 'all vows broken');
        done();
      }
    );
  });
  it('All vows kept - with any', done => {
    const vow1 = sut.vow.make();
    const vow2 = sut.vow.make();
    const fate = 'All kept the faith';
    global.setTimeout(() => {
      vow1.keep(fate);
    }, 0);
    global.setTimeout(() => {
      vow2.keep(fate);
    }, 0);
    sut.vow.any([vow1.promise, vow2.promise]).when(
      value => {
        test.strictEqual(value.length, 2, 'results length is 2');
        test.strictEqual(value[0], fate, 'all vows kept');
        test.strictEqual(value[1], fate, 'all vows kept');
        done();
      },
      () => {
        throw new Error('Should have never run');
      }
    );
  });
  it('Some vows kept - with any', done => {
    const vow1 = sut.vow.make();
    const vow2 = sut.vow.make();
    const fate = 'Some kept the faith';
    const reason = 'Some lost the faith';
    global.setTimeout(() => {
      vow1.keep(fate);
    }, 0);
    global.setTimeout(() => {
      vow2.break(reason);
    }, 0);
    sut.vow.any([vow1.promise, vow2.promise]).when(
      value => {
        test.strictEqual(value.length, 1, 'results length is 1');
        test.strictEqual(value[0], fate, 'kept vow');
        test.strictEqual(value[1], undefined, 'broken vow');
        done();
      },
      () => {
        throw new Error('Should have never run');
      }
    );
  });
  it('No vows kept - with any', done => {
    const vow1 = sut.vow.make();
    const vow2 = sut.vow.make();
    const reason = 'All lost the faith';
    global.setTimeout(() => {
      vow1.break(reason);
    }, 0);
    global.setTimeout(() => {
      vow2.break(reason);
    }, 0);
    sut.vow.any([vow1.promise, vow2.promise]).when(
      value => {
        test.strictEqual(value.length, 0, 'results length is 0');
        done();
      },
      () => {
        throw new Error('Should have never run');
      }
    );
  });
  it('Already kept promise', done => {
    const fate = 'Kept the faith';
    const promise = sut.vow.kept(fate);
    test.strictEqual(promise.isPromise, true, 'Is a kept promise');
    promise.when(
      value => {
        test.strictEqual(value, fate, 'vow kept');
        done();
      },
      () => {
        throw new Error('Should have never run');
      }
    );
  });
  it('Already broken promise', done => {
    const reason = 'Lost the faith';
    const promise = sut.vow.broken(reason);
    test.strictEqual(promise.isPromise, true, 'Is a kept promise');
    promise.when(
      () => {
        throw new Error('Should have never run');
      },
      value => {
        test.strictEqual(value, reason, 'vow broken');
        done();
      }
    );
  });
  it('Already kept promise with promise', done => {
    const fate = sut.vow.kept('Kept the faith');
    const promise = sut.vow.kept(fate);
    test.strictEqual(promise.isPromise, true, 'Is a kept promise');
    promise.when(
      value => {
        test.strictEqual(value, fate, 'vow kept');
        done();
      },
      () => {
        throw new Error('Should have never run');
      }
    );
  });
  it('Already broken promise with promise', done => {
    const reason = sut.vow.broken('Lost the faith');
    const promise = sut.vow.broken(reason);
    test.strictEqual(promise.isPromise, true, 'Is a kept promise');
    promise.when(
      () => {
        throw new Error('Should have never run');
      },
      value => {
        test.strictEqual(value, reason, 'vow broken');
        done();
      }
    );
  });
});
