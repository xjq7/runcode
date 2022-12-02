对象合并

深度合并两个对象可枚举属性, 并且修改新对象不会影响原对象, 相同的属性则以 b 对象为主

用例 1:

```js
const a = { a: 1 };
const b = { b: 2 };

deepMerge(a, b); // { a: 1, b: 2 }
```

用例 2:

```js
const a = { foo: { bar: 0 }, arr: [1, 3, { a: { b: 1 } }] };
const b = { foo: { bar: 1 }, arr: [1, 2, { b: { a: 1 } }] };

deepMerge(a, b); // { foo: { bar: 1 }, arr: [1, 2, { a: { b: 1 }, b: { a: 1 } }] }
```

用例 3:

b 属性值为 undefined 不会并入 a

```js
const a = { a: 1 };
const b = { a: undefined };

deepMerge(a, b); // { a: 1 }
```

用例 4:

```js
const a = { a: 1 };
const b = undefined;

deepMerge(a, b); // { a: 1 }
```

用例 5:

```js
const a = undefined;
const b = { a: 1 };

deepMerge(a, b); // { a: 1 }
```
