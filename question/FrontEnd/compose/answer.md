### 方法一

拆解分析, 只有两个中间件的情况

每个中间件为前一个中间件的参数

```js
const compose = (m1, m2) => {
  return (x) => {
    return m1(m2(x));
  };
};
```

reduce 组合中间件函数

```js
export default function compose(...args) {
  if (args.length === 0) return (x) => x;
  if (args.length === 1) return args[0];
  return args.reduce(
    (acc, cur) =>
      (...args) =>
        acc(cur(...args))
  );
}
```
