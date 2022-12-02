import compose from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

const double = (x) => x * 2;
const square = (x) => x * x;

it('用例 1: 输入 compose()(5)', () => {
  assert.equal(compose()(5), 5);
});

it('用例 2: 输入 compose(double, square)(10)', () => {
  assert.equal(compose(double, square)(10), 200);
});

it('用例 3: 输入 compose(square, double)(5)', () => {
  assert.equal(compose(square, double)(5), 100);
});

it('用例 4: 输入 compose(double, square)(final)(5)', () => {
  const double = (next) => (x) => next(x * 2);
  const square = (next) => (x) => next(x * x);
  const final = (x) => x;
  assert.equal(compose(double, square)(final)(5), 100);
});

it("用例 5: 输入 compose(a, b, c)(final)('')", () => {
  const a = (next) => (x) => next(x + 'a');
  const b = (next) => (x) => next(x + 'b');
  const c = (next) => (x) => next(x + 'c');
  const final = (x) => x;
  assert.equal(compose(a, b, c)(final)(''), 'abc');
});
