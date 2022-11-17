### 方法一

正则表达式

```js
export default function amountThousandthsFormat(amount) {
  return amount.replace(/(?<!\.\d*)\B(?=(?:\d{3})+\b)/, ',');
}
```
