import f from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it('一层数组: 输入 [1, 2, 3]', () => {
  assert.deepEqual(f([1, 2, 3]), [1, 2, 3]);
});

it('两层数组: 输入 [1, [2, 3]]', () => {
  assert.deepEqual(f([1, [2, 3]]), [1, 2, 3]);
});

it('四层数组: 输入 [1, [[2, 2], [3, [4]], 5]]', () => {
  assert.deepEqual(f([1, [[2, 2], [3, [4]], 5]]), [1, 2, 2, 3, 4, 5]);
});
