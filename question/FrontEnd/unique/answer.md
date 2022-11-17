### 方法一

利用 set 去除

```js
export default function unique(arr) {
  return [...new Set(arr)];
}
```
