### 方法一

```js
export default function flatten(arr) {
  return arr.reduce((acc, cur) => {
    if (Array.isArray(cur)) {
      acc = acc.concat(flatten(cur));
    } else {
      acc.push(cur);
    }
    return acc;
  }, []);
}
```
