将数组按从小到大的顺序排序

输入为 数字数组

- 冒泡排序
- 选择排序
- 插入排序
- 归并排序
- 堆排序
- 快速排序

...

用例 1:

```js
const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const sortArr = sort(arr);

console.log(sortArr); // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

用例 2:

```js
const arr = [1, 9, 2, 4, 3, 7, 6, 8, 6];
const sortArr = sort(arr);

console.log(sortArr); // [1, 2, 3, 4, 5, 6, 7, 8, 9]
```

用例 3:

```js
const arr = [1, 1, 1, 3, 4, 5, 7, 6, 6, 6, 0, 0, -1];
const sortArr = sort(arr);

console.log(sortArr); // [-1, 0, 0, 1, 1, 1, 3, 4, 5, 6, 6, 6, 7]
```
