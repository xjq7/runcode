扁平化一棵树

输入一棵树, 输出书中 id 的扁平集合

用例 1:

```js
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

flattenTree(tree1); // [0, 1, 2, 3, 4]
```

用例 2:

```js
const tree2 = [];
flattenTree(tree2); // []
```

用例 3:

```js
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
flattenTree(tree3); // [0, 1, 2, 3]
```

用例 4:

```js
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
flattenTree(tree4); // [0, 1, 2, 3, 4, 5, 6]
```
