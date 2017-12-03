# monad-js

[![npm version](https://badge.fury.io/js/monad-js.svg)](https://badge.fury.io/js/monad-js)
[![npm module downloads](http://img.shields.io/npm/dt/monad-js.svg)](https://www.npmjs.org/package/monad-js)
[![Build Status](https://travis-ci.org/borota/monad-js.svg?branch=master)](https://travis-ci.org/borota/monad-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/borota/monad-js/blob/master/LICENSE)
[![Dependency Status](https://david-dm.org/borota/monad-js.svg)](https://david-dm.org/borota/monad-js)
[![devDependencies Status](https://david-dm.org/borota/monad-js/dev-status.svg)](https://david-dm.org/borota/monad-js?type=dev)
[![Coverage Status](https://coveralls.io/repos/github/borota/monad-js/badge.svg?branch=master)](https://coveralls.io/github/borota/monad-js?branch=master)

Douglas Crockford's monad library as UMD/ES6 module

## Installation

Make sure [Node.js](https://nodejs.org) is installed. Then run:
```
npm install monad-js --save
```

Following bundles are available:
* `monad-js.js` - UMD ES5 version for use in browser, node, etc.
* `monad-js.min.js` - minified version of `monad-js.js`
* `monad-js.esm.js` - ES6 module version, which can be used by bundlers like
`rollup` or `webpack`

The package could also be downloaded directly from:
[https://registry.npmjs.org/monad-js/-/monad-js-1.0.6.tgz](https://registry.npmjs.org/monad-js/-/monad-js-1.0.6.tgz)

## More information
A monad is, depending on the language and implementation, an `object` / `class`
/ `interface` / `type` with two required operations:
  * `unit` (or `return`, `inject`) operation which sticks/shoves some arbitrary
    data `a` into a monad `M a`. It could be viewed as a constructor or factory
    taking in `a` and returning `M a`.
    In short: `unit = a => M a`
  *	`bind` (or `pipe`, `>>=`) operation taking in a monad `M a` and a function
    `a => M b` and combining them to return a new monad `M b`.
    In short: `bind = (M a, a => M b) => M b`

Reason for existence of monads is to be able to compose functions that otherwise
could not be composed, as they may be working on different domains.
See [Brian Beckman: Don't fear the Monad (video)](https://www.youtube.com/watch?v=ZhuHCtR3xq8)
for an excellent explanation.

See also:

[Douglas Crockford's code](https://github.com/douglascrockford/monad)

[Douglas Crockford on Monads (video)](https://www.youtube.com/watch?v=dkZFtimgAcM)

[Notes from Crockford on Monads](https://gist.github.com/newswim/4668aef8a1f1bc0dabe8)

[The Marvels of Monads by Wes Dyer](https://blogs.msdn.microsoft.com/wesdyer/2008/01/10/the-marvels-of-monads/)

[Eric Lippert on Monads in .NET](https://ericlippert.com/category/monads/)

## License

[MIT](https://github.com/borota/monad-js/blob/master/LICENSE)

## Motivation

I wanted to be able to easily add Douglas Crockford's monad work to my projects
via `npm`.

You are welcomed to improve this implementation or provide feedback. Please
feel free to [Fork](https://help.github.com/articles/fork-a-repo/), create a
[Pull Request](https://help.github.com/articles/about-pull-requests/) or
submit [Issues](https://github.com/borota/monad-js/issues).
Thank you!

## Development

```
npm install
```
```
npm run build
```

## API Reference

* [monadJs](#module_monadJs)
    * [.identity](#module_monadJs.identity)
    * [.maybe](#module_monadJs.maybe)
    * [.makeMonad](#module_monadJs.makeMonad)
    * [.vow](#module_monadJs.vow)

<a name="module_monadJs.identity"></a>

### monadJs.identity
The Identity Monad
```
 const monad = identity("Hello world.");
 monad.bind(alert);
```

**Kind**: static property of [<code>monadJs</code>](#module_monadJs)  
<a name="module_monadJs.maybe"></a>

### monadJs.maybe
Maybe monad is used to guard against Null Pointer Exceptions.
```
 const monad = maybe(null);
 monad.bind(alert);    // Nothing happens.
```

**Kind**: static property of [<code>monadJs</code>](#module_monadJs)  
<a name="module_monadJs.makeMonad"></a>

### monadJs.makeMonad
The `makeMonad` function is a macroid that produces monad constructor
functions. It can take an optional `modifier` function, which is a function
that is allowed to modify new monads at the end of the construction processes.

A monad constructor (sometimes called `unit` or `return` in some mythologies)
comes with three methods, `lift`, `liftValue`, and `method`, all of which can
add methods and properties to the monad's prototype.

A monad has a `bind` method that takes a function that receives a value and
is usually expected to return a monad.
```
   const identity = makeMonad();
   const monad = identity("Hello world.");
   monad.bind(alert);

   const ajax = makeMonad()
     .lift('alert', alert);
   const monad = ajax("Hello world.");
   monad.alert();

   const maybe = makeMonad(function (monad, value) {
       if (value === null || value === undefined) {
           monad.isNull = true;
           monad.bind = function () {
               return monad;
           };
           return null;
       }
       return value;
   });
   const monad = maybe(null);
   monad.bind(alert);    // Nothing happens.
```

**Kind**: static property of [<code>monadJs</code>](#module_monadJs)  
<a name="module_monadJs.vow"></a>

### monadJs.vow
Create a `vow` object, used to handle promises

NOTE: ES6 has native support for Promises. This implementation could still be
used to create promises in ES5 though.

**Kind**: static constant of [<code>monadJs</code>](#module_monadJs)  
