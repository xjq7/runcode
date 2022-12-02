import isAmount from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it('用例 1: 输入 1.23', () => {
  assert.equal(isAmount('1.23'), true);
});

it('用例 2: 输入 256.23', () => {
  assert.equal(isAmount('256.23'), true);
});

it('用例 3: 输入 0.23', () => {
  assert.equal(isAmount('0.23'), true);
});

it('用例 4: 输入 0.2', () => {
  assert.equal(isAmount('0.2'), true);
});

it('用例 5: 输入 0.234', () => {
  assert.equal(isAmount('0.234'), false);
});

it('用例 6: 输入 0.', () => {
  assert.equal(isAmount('0.'), false);
});

it('用例 7: 输入 .2', () => {
  assert.equal(isAmount('.2'), false);
});

it('用例 8: 输入 20', () => {
  assert.equal(isAmount('20'), true);
});

it('用例 9: 输入 02', () => {
  assert.equal(isAmount('02'), false);
});

it('用例 10: 输入 102', () => {
  assert.equal(isAmount('102'), true);
});

it('用例 11: 输入 102.2', () => {
  assert.equal(isAmount('102.2'), true);
});
