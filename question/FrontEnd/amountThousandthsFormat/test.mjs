import f from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it('无需格式化-原样输出: 输入 314', () => {
  assert.deepEqual(f('314'), '314');
});

it('输入 31415926', () => {
  assert.deepEqual(f('31415926'), '31,415,926');
});

it('带小数位: 输入 31415926.62', () => {
  assert.deepEqual(f('31,415,926.62'), '31,415,926.62');
});

it('带长小数位: 输入 31415926.629514', () => {
  assert.deepEqual(f('31,415,926.629514'), '31,415,926.629514');
});
