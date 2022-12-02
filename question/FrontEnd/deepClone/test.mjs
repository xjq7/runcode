import f from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it('一层对象: 输入 { f: 2 }', () => {
  assert.deepEqual(f({ f: 2 }), { f: 2 });
});

it('两层对象: 输入 { a: 1, b: { c: 3 } }', () => {
  assert.deepEqual(f({ a: 1, b: { c: 3 } }), { a: 1, b: { c: 3 } });
});

it('数组: 输入 [1, { a: 1 }]', () => {
  assert.deepEqual(f([1, { a: 1 }]), [1, { a: 1 }]);
});

it('修改拷贝对象属性, 原对象应不受影响', () => {
  const Input = { b: { c: 1, d: 2 } };
  const cloneObj = f(Input);
  cloneObj.b.c = 2;
  assert.deepEqual(Input, {
    b: { c: 1, d: 2 },
  });
});

it('循环引用', () => {
  const circle1 = { foo: 1 };
  const circle2 = { bar: 2, c1: circle1 };
  circle1.c2 = circle2;
  assert.deepEqual(f(circle1), { foo: 1, c2: { bar: 2, c1: {} } });
});
