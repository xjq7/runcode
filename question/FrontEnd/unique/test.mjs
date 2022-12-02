import f from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it('无重复数字: 输入 [1, 2, 3]', () => {
  assert.deepEqual(f([1, 2, 3]), [1, 2, 3]);
});

it('单个重复数字: 输入 [1, 2, 3, 3]', () => {
  assert.deepEqual(f([1, 2, 3, 3]), [1, 2, 3]);
});

it('多个重复数字: 输入 [1, 1, 2, 2, 2, 3, 3]', () => {
  assert.deepEqual(f([1, 1, 2, 2, 2, 3, 3]), [1, 2, 3]);
});
