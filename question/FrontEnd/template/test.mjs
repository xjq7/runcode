import template from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it(': 输入 ', () => {
  assert.deepEqual(template(), undefined);
});
