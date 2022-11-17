金额千分位格式化

用例 1:

```js
const amount = '314';
const formatAmount = amountThousandthsFormat(amount);

console.log(formatAmount); // '314'
```

用例 2:

```js
const amount = '31415926';
const formatAmount = amountThousandthsFormat(amount);

console.log(formatAmount); // '3,415,926'
```

用例 3:

```js
// 带小数位
const amount = '31415926.62';
const formatAmount = amountThousandthsFormat(amount);

console.log(formatAmount); // '3,415,926.62'
```

用例 4:

```js
// 带长小数位
const amount = '31415926.629514';
const formatAmount = amountThousandthsFormat(amount);

console.log(formatAmount); // '3,415,926.629514'
```
