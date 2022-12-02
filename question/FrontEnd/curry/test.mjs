import f from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

const add = (...args) => args.reduce((a, b) => a + b, 0);
const multi = (...args) => args.reduce((a, b) => a * b, 1);

function Received(Input) {
  let curry;
  const output = [];
  Input.forEach((arg) => {
    let result;
    if (!curry) {
      curry = f(arg);
      result = !!curry;
    } else if (arg) {
      result = curry(...arg);
    } else {
      result = curry();
    }
    output.push(result);
  });
  return output;
}

it('加法函数柯里化一: 输入 [add, [1], [2], [3], null]', () => {
  assert.deepEqual(Received([add, [1], [2], [3], null]), [
    true,
    null,
    null,
    null,
    6,
  ]);
});

it('加法函数柯里化二: 输入 [add, [1, 2, 1], null, null, null]', () => {
  assert.deepEqual(Received([add, [1, 2, 1], null, null, null]), [
    true,
    null,
    4,
    4,
    4,
  ]);
});

it('加法函数柯里化三: 输入 [add, [1, 2, 1], null, [1, 2], null]', () => {
  assert.deepEqual(Received([add, [1, 2, 1], null, [1, 2], null]), [
    true,
    null,
    4,
    null,
    7,
  ]);
});

it('乘法函数柯里化一: 输入 [multi, [100], null, [1, 2], null]', () => {
  assert.deepEqual(Received([multi, [100], null, [1, 2], null]), [
    true,
    null,
    100,
    null,
    200,
  ]);
});
