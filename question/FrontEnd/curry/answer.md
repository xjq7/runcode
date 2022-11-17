### 方法一

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
