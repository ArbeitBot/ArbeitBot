# pug-walk

Walk and transform a pug AST

[![Build Status](https://img.shields.io/travis/pugjs/pug-walk/master.svg)](https://travis-ci.org/pugjs/pug-walk)
[![Dependency Status](https://img.shields.io/gemnasium/pugjs/pug-walk.svg)](https://gemnasium.com/pugjs/pug-walk)
[![NPM version](https://img.shields.io/npm/v/pug-walk.svg)](https://www.npmjs.org/package/pug-walk)

## Installation

    npm install pug-walk

## Usage


```js
var lex = require('pug-lexer');
var parse = require('pug-parser');
var walk = require('pug-walk');

var ast = walk(parse(lex('.my-class foo')), function before(node, replace) {
  // called before walking the children of `node`
  // to replace the node, call `replace(newNode)`
  // return `false` to skip descending
  if (node.type === 'Text') {
    replace({ type: 'Text', val: 'bar', line: node.line });
  }
}, function after(node, replace) {
  // called after walking the children of `node`
  // to replace the node, call `replace(newNode)`
}, {includeDependencies: true});
assert.deepEqual(parse(lex('.my-class bar')), ast);
```

## License

  MIT
