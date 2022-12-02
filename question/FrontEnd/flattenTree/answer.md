### 方法一

递归处理

子节点不为空的时候, 递归遍历并拼接至当前结果之后

```js
export default function flattenTree(tree) {
  return tree.reduce((acc, cur) => {
    const { id, children } = cur;
    acc.push(id);
    if (children && children.length) {
      acc = acc.concat(flattenTree(children));
    }
    return acc;
  }, []);
}
```

### 方法二

栈

```js
export default function flattenTree(tree) {
  const stack = [...tree.reverse()];
  const ans = [];

  while (stack.length) {
    const top = stack[stack.length - 1];
    stack.pop();
    ans.push(top.id);
    if (top.children && top.children.length) {
      stack.push(...top.children.reverse());
    }
  }
  return ans;
}
```
