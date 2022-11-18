import f from './index.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it(': 输入 ', () => {
  assert.deepEqual(f(), {});
});
