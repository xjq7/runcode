### 方法一

通过闭包函数存储参数, 待到无参传递时调用 fn 函数,并将全部参数传递给 fn 函数

```js
export default function currying(fn) {
  let _args = [];
  return (...args) => {
    let result = null;
    if (args.length) {
      _args = _args.concat(args);
    } else {
      result = fn(..._args);
    }
    return result;
  };
}
```
