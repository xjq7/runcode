import assert from 'assert';
import f from './index.mjs';

const cases = [
  {
    Input: [],
    Expected: [],
    Message: '空数组',
  },
  {
    Input: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    Expected: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    Message: '已排序好的数组',
  },
  {
    Input: [1, 9, 2, 4, 3, 7, 6, 8, 5],
    Expected: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    Message: '乱序数组一',
  },
  {
    Input: [1, 1, 1, 3, 4, 5, 7, 6, 6, 6, 0, 0, -1],
    Expected: [-1, 0, 0, 1, 1, 1, 3, 4, 5, 6, 6, 6, 7],
    Message: '乱序数组二-包含负数',
  },
];

(function () {
  for (let i = 0; i < cases.length; i++) {
    const { Input, Expected, Message } = cases[i];
    let output;
    try {
      output = f(Input);
      assert.deepEqual(output, Expected);
    } catch (error) {
      console.log('用例 ' + String(i + 1) + ': ' + Message + ' 未通过');
      if (error.code === 'ERR_ASSERTION') {
        console.log('Input:', JSON.stringify(Input));
        console.log('Expected:', JSON.stringify(error.expected));
        console.log('Received:', JSON.stringify(output));
      } else {
        console.log(error);
      }
      break;
    }
    console.log('用例 ' + String(i + 1) + ': ' + Message + ' 通过');
  }
})();
