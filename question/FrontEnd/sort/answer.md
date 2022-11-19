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
