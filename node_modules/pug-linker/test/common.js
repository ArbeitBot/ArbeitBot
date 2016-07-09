var assert = require('assert');

exports.prettyStringify = function prettyStringify (obj) {
  return JSON.stringify(obj, null, '  ');
}

// TODO: investigate if/how assert.deepEqual is buggy
exports.assertObjEqual = function assertObjEqual (a, b) {
  assert.equal(JSON.stringify(a), JSON.stringify(b));
}
