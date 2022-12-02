### 方法一

正则表达式

```js
export default function isAmount(amount) {
  return /^\d+(\.\d{1,2})?$/.test(amount);
}
```
