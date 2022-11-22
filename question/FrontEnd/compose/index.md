实现 compose 函数

在 Koa 洋葱模型中, 我们希望每个请求经过几层中间件的处理, 例如 跨域中间件, 鉴权中间件, 日志中间件

<img src="https://image.xjq.icu/2022/11/22/1669046983667_%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20221122000922.png" />

我们需要编写一个 compose 函数, 将中间件以数组参数传入方式转化为 函数嵌套的形式

中间件为纯函数的情况下

例: 将 [a,b,c] 转换为 a(b(c(...args)))

Koa 中间件为 闭包函数

例: 将 [a,b,c] 转换为 a(b(c(final)))(initial)

用例 1:

无中间件

```js
compose()(5); // 5
```

用例 2:

中间件为纯函数

```js
const double = (x) => x * 2;
const square = (x) => x * x;

// 先平方计算再乘法计算
compose(double, square)(10); // 200
```

用例 3:

中间件为闭包函数

```js
// a(b(c(final)))(initial)

const a = (next) => (x) => next(x + 'a');
const b = (next) => (x) => next(x + 'b');
const c = (next) => (x) => next(x + 'c');
const final = (x) => x;

compose(a, b, c)(final)(''); // abc
```
