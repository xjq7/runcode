/**
 * interface TreeNode{
 *    id: number;
 *    children: TreeNode[]
 * }
 *
 * @export
 * @param {TreeNode[]} tree
 * @return {number[]}
 */
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
