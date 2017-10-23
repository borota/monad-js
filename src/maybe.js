/** @module monadJs */
import makeMonad from './monad';

/**
 * Maybe monad is used to guard against Null Pointer Exceptions.
 * ```
 *  const monad = maybe(null);
 *  monad.bind(alert);    // Nothing happens.
 * ```
 * @name maybe
 * @static
 */
export default makeMonad((monad, value) => {
  if (value === null || value === undefined) {
    monad.isNull = true;
    monad.bind = function bind() {
      return monad;
    };
    return null;
  }
  monad.isNull = false;
  return value;
});
