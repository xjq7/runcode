### 方法一

原生 api sort 方法

```js
export default function sort(arr) {
  // js api
  return arr.sort();
}
```

### 方法二

快速排序

```js
function quicksort(arr, l = 0, r = arr.length - 1) {
  const t = arr[l];

  if (l >= r) return;

  let _r = r,
    _l = l;

  while (_l < _r) {
    while (_r > _l && arr[_r] >= t) {
      _r--;
    }
    while (_l < _r && arr[_l] <= t) {
      _l++;
    }

    if (_l < _r) {
      const temp = arr[_l];
      arr[_l] = arr[_r];
      arr[_r] = temp;
    }
  }

  arr[l] = arr[_l];
  arr[_l] = t;

  quicksort(arr, l, _l - 1);
  quicksort(arr, _r + 1, r);
  return arr;
}
```

### 方法三

冒泡排序

```js
export default function sort(arr) {
  let len = arr.length;
  for (let i = 0; i < len - 1; i++) {
    for (let j = 0; j < len - i; j++) {
      if (arr[j] > arr[j + 1]) {
        let temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
      }
    }
  }
  return arr;
}
```
