import f from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it('一层对象: 输入 { a: 1 }, { b: 2 }', () => {
  assert.deepEqual(f({ a: 1 }, { b: 2 }), { a: 1, b: 2 });
});

it('两层对象: 输入 { a: 1, b: { c: 2 } }, { b: 2 }', () => {
  assert.deepEqual(f({ a: 1, b: { c: 2 } }, { b: { c: 3, d: 4 } }), {
    a: 1,
    b: { c: 3, d: 4 },
  });
});

it("两层对象存在数组合并: 输入 { b: { c: [1, 3, { a: 1 }] } }, { b: { c: ['1', 2, { a: 2 }] } }", () => {
  assert.deepEqual(
    f({ b: { c: [1, 3, { a: 1 }] } }, { b: { c: ['1', 2, { a: 2 }] } }),
    { b: { c: ['1', 2, { a: 2 }] } }
  );
});

it('b 中属性值为 undefined 时不会合并: 输入 { a: 1 }, { a: undefined }', () => {
  assert.deepEqual(f({ a: 1 }, { a: undefined }), { a: 1 });
});

it('边界输入一 undefined | null, { a: 1 }', () => {
  assert.deepEqual(f(undefined, { a: 1 }), { a: 1 });
  assert.deepEqual(f(null, { a: 1 }), { a: 1 });
});

it('边界输入二 { a: 1 }, undefined | null', () => {
  assert.deepEqual(f({ a: 1 }, undefined), { a: 1 });
  assert.deepEqual(f({ a: 1 }, null), { a: 1 });
});
