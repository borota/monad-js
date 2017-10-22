/** @module monadJs */

/**
 * The `makeMonad` function is a macroid that produces monad constructor
 * functions. It can take an optional `modifier` function, which is a function
 * that is allowed to modify new monads at the end of the construction processes.
 *
 * A monad constructor (sometimes called `unit` or `return` in some mythologies)
 * comes with three methods, `lift`, `liftValue`, and `method`, all of which can
 * add methods and properties to the monad's prototype.
 *
 * A monad has a `bind` method that takes a function that receives a value and
 * is usually expected to return a monad.
 * ```
 *    const identity = makeMonad();
 *    const monad = identity("Hello world.");
 *    monad.bind(alert);
 *
 *    const ajax = makeMonad()
 *      .lift('alert', alert);
 *    const monad = ajax("Hello world.");
 *    monad.alert();
 *
 *    const maybe = makeMonad(function (monad, value) {
 *        if (value === null || value === undefined) {
 *            monad.isNull = true;
 *            monad.bind = function () {
 *                return monad;
 *            };
 *            return null;
 *        }
 *        return value;
 *    });
 *    const monad = maybe(null);
 *    monad.bind(alert);    // Nothing happens.
 * ```
 * @name makeMonad
 * @static
 */
export default function makeMonad(modifier) {
  // Each unit constructor has a monad prototype. The prototype will contain an
  // isMonad property for classification, as well as all inheritable methods.

  const prototype = Object.create(null);
  prototype.isMonad = true;

  // Each call to makeMonad will produce a new unit constructor function.

  function unit(value) {
    // Construct a new monad.

    const monad = Object.create(prototype);

    // In some mythologies 'bind' is called 'pipe' or '>>='.
    // The bind method will deliver the unit's value parameter to a function.

    monad.bind = function bind(func, args) {
      // bind takes a function and an optional array of arguments. It calls that
      // function passing the monad's value and bind's optional array of args.

      return func(value, ...args);
    };

    // If makeMonad's modifier parameter is a function, then call it, passing the monad
    // and the value.

    if (typeof modifier === 'function') {
      value = modifier(monad, value);
    }

    // Return the shiny new monad.

    return monad;
  }
  unit.method = function method(name, func) {
    // Add a method to the prototype.

    prototype[name] = func;
    return unit;
  };
  unit.liftValue = function liftValue(name, func) {
    // Add a method to the prototype that calls bind with the func. This can be
    // used for ajax methods that return values other than monads.

    prototype[name] = function liftedValue(...args) {
      return this.bind(func, args);
    };
    return unit;
  };
  unit.lift = function lift(name, func) {
    // Add a method to the prototype that calls bind with the func. If the value
    // returned by the func is not a monad, then make a monad.

    prototype[name] = function lifted(...args) {
      const result = this.bind(func, args);
      return result && result.isMonad === true ? result : unit(result);
    };
    return unit;
  };
  return unit;
}
