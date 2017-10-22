/** @module monadJs */
import makeMonad from './monad';

/**
 * The Identity Monad
 * ```
 *  const monad = identity("Hello world.");
 *  monad.bind(alert);
 * ```
 * @name identity
 * @static
 */
export default makeMonad();
