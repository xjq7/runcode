### 方法一

正则表达式

```js
export default function isIp(ip) {
  return /^((2(5[0-5]|[0-4]\d)|1\d{2}|\d{1,2})\.){3}(2(5[0-5]|[0-4]\d)|1\d{2}|\d{1,2})$/.test(
    ip
  );
}
```
