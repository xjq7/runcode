import constructTree from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

const flattenTree1 = [
  {
    id: 0,
    pid: null,
  },
  { id: 1, pid: 0 },
  { id: 2, pid: 1 },
  { id: 3, pid: 0 },
  {
    id: 4,
    pid: 1,
  },
  {
    id: 5,
    pid: 2,
  },
];

it('输入 flattenTree1', () => {
  assert.deepEqual(constructTree(flattenTree1), {
    id: 0,
    children: [
      {
        id: 1,
        children: [{ id: 2, children: [{ id: 5 }] }],
      },
      { id: 3 },
      { id: 4 },
    ],
  });
});
