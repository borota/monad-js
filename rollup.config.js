import buble from 'rollup-plugin-buble';
import istanbul from 'rollup-plugin-istanbul';
import uglify from 'rollup-plugin-uglify';
import pkg from './package.json';

const isProduction = process.env.BUILD === 'production';
const isDev = process.env.BUILD === 'dev';
const banner = isProduction
  ? '/**\n' +
    "* @file Douglas Crockford's monad library as UMD/ES6 module\n" +
    '* @version 1.0.6\n' +
    "* Based on Douglas Crockford's Public Domain monad.js library.\n" +
    "* This is an almost verbatim copy of Douglas Crockford's work, but\n" +
    '* made easy for use in browser/node.js, or as an ES6 module.\n' +
    '*\n' +
    '* As github does not provide a Public Domain option as one of the\n' +
    '* supported licenses, this work uses the liberal MIT license instead.\n' +
    '* @copyright (c) 2017 Greg Borota.\n' +
    '* @license MIT\n' +
    '*\n' +
    '* Permission is hereby granted, free of charge, to any person obtaining a copy\n' +
    '* of this software and associated documentation files (the "Software"), to deal\n' +
    '* in the Software without restriction, including without limitation the rights\n' +
    '* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n' +
    '* copies of the Software, and to permit persons to whom the Software is\n' +
    '* furnished to do so, subject to the following conditions:\n' +
    '*\n' +
    '* The above copyright notice and this permission notice shall be included in\n' +
    '* all copies or substantial portions of the Software.\n' +
    '*\n' +
    '* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n' +
    '* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n' +
    '* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n' +
    '* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n' +
    '* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM\n' +
    '* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE\n' +
    '* SOFTWARE.\n' +
    '*/\n\n' +
    '// https://github.com/douglascrockford/monad\n' +
    '// https://gist.github.com/newswim/4668aef8a1f1bc0dabe8\n' +
    '// https://www.youtube.com/watch?v=dkZFtimgAcM\n' +
    '// https://www.youtube.com/watch?v=ZhuHCtR3xq8\n' +
    '// https://blogs.msdn.microsoft.com/wesdyer/2008/01/10/the-marvels-of-monads/'
  : '';

const external = Object.keys(pkg.dependencies);
const input = 'src/main.js';
const name = 'monadJs';
const format = 'umd';
const globals = {};
const sourcemap = !isProduction;
const plugins = [buble()];

// browser/nodejs-friendly UMD build
const targets = [
  {
    input,
    output: [{ file: pkg.main, format }],
    external,
    plugins: plugins.slice(0),
    name,
    globals,
    banner,
    sourcemap
  }
];

if (isProduction) {
  // ES module (for bundlers) build.
  targets.push({
    input,
    output: [{ file: pkg.module, format: 'es' }],
    external,
    plugins: plugins.slice(0),
    banner
  });

  plugins.push(
    uglify({
      output: {
        comments: (node, comment) => {
          const { value, type } = comment;
          return type === 'comment2' && /@license/i.test(value);
        }
      }
    })
  );

  // browser/nodejs-friendly minified UMD build
  targets.push({
    input,
    output: [{ file: pkg.mainMin, format }],
    external,
    plugins,
    name,
    globals,
    banner
  });
} else if (!isDev) {
  targets[0].plugins.push(
    istanbul({
      exclude: ['test/**/*', 'node_modules/**/*']
    })
  );
}

export default targets;
