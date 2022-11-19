实现一个柯里化函数

直到未传递参数时真正调用函数

用例 1:

```js
const add = (...args) => args.reduce((a, b) => a + b, 0);

// 输入 [add, [1], [2], [3], null]

// 执行
const curryAdd = currying(add); // true
curryAdd(1); // null
curryAdd(2); // null
curryAdd(3); // null
curryAdd(); // 6

// [true, null, null, null, 6]
```

用例 2:

```js
const add = (...args) => args.reduce((a, b) => a + b, 0);

// 输入 [add, [1, 2, 1], null, null, null]
const curryAdd = currying(add); // true
curryAdd(1, 2, 1); // null
curryAdd(); // 4
curryAdd(); // 4
curryAdd(); // 4

// [true, null, 4, 4, 4]
```

用例 3:

```js
const add = (...args) => args.reduce((a, b) => a + b, 0);

// 输入 [add, [1, 2, 1], null, [1, 2], null]
const curryAdd = currying(add); // true
curryAdd(1, 2, 1); // null
curryAdd(); // 4
curryAdd(1, 2); // null
curryAdd(); // 7

// [true, null, 4, null, 7]
```

用例 4:

```js
const multi = (...args) => args.reduce((a, b) => a * b, 1);

// 输入 [multi, [100], null, [1, 2], null]
const curryMulti = currying(multi);
curryMulti(100); // null
curryMulti(); // 100
curryMulti(1, 2); // null
curryMulti(); // 200
// [true, null, 100, null, 200]
```
