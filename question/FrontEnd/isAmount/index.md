金额合法性判断

合法的金额包含整数以及小数点后不超过两位的小数

用例 1:

```js
const amount = '20';
isAmount(amount); // true
```

用例 2:

```js
const amount = '1.23';
isAmount(amount); // true
```

用例 3:

```js
const amount = '1.';
isAmount(amount); // false
```

用例 4:

```js
const amount = '0.2';
isAmount(amount); // true
```

用例 5:

```js
const amount = '.1';
isAmount(amount); // false
```

用例 6:

```js
const amount = '02';
isAmount(amount); // false
```
