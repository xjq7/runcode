import f from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it('用例 1: 输入 127.0.0.1', () => {
  assert.deepEqual(f('127.0.0.1'), true);
});

it('用例 2: 输入 192.168.1.1', () => {
  assert.deepEqual(f('192.168.1.1'), true);
});

it('用例 3: 输入 0.0.0.0', () => {
  assert.deepEqual(f('0.0.0.0'), true);
});

it('用例 4: 输入 254.254.254.256', () => {
  assert.deepEqual(f('254.254.254.256'), false);
});

it('用例 5: 输入 255.255.255.255', () => {
  assert.deepEqual(f('255.255.255.255'), true);
});

it('用例 6: 输入 192.168.1.-1', () => {
  assert.deepEqual(f('192.168.1.-1'), false);
});

it('用例 7: 输入 192.168.1.260', () => {
  assert.deepEqual(f('192.168.1.260'), false);
});
