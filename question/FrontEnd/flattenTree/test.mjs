import flattenTree from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

const tree1 = [
  {
    id: 0,
    children: [
      {
        id: 1,
        children: [
          {
            id: 2,
            children: [],
          },
        ],
      },
      {
        id: 3,
        children: [],
      },
    ],
  },
  {
    id: 4,
    children: [],
  },
];

it('输入 tree1', () => {
  assert.deepEqual(flattenTree(tree1), [0, 1, 2, 3, 4]);
});

const tree2 = [];

it('输入 tree2 空树', () => {
  assert.deepEqual(flattenTree(tree2), []);
});

const tree3 = [
  {
    id: 0,
    children: [],
  },
  {
    id: 1,
    children: [],
  },
  {
    id: 2,
    children: [],
  },
  {
    id: 3,
    children: [],
  },
];

it('输入 tree3 一颗只有一层节点的树', () => {
  assert.deepEqual(flattenTree(tree3), [0, 1, 2, 3]);
});

const tree4 = [
  {
    id: 0,
    children: [
      {
        id: 1,
        children: [
          {
            id: 2,
            children: [],
          },
        ],
      },
      {
        id: 3,
        children: [
          {
            id: 4,
            children: [
              {
                id: 5,
                children: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 6,
    children: [],
  },
];

it('输入 tree4', () => {
  assert.deepEqual(flattenTree(tree4), [0, 1, 2, 3, 4, 5, 6]);
});
