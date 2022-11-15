import assert from 'assert';
import f from './index.mjs';

const cases = [
  {
    Input: [1, 2, 3],
    Expected: [1, 2, 3],
    Message: '一层数组',
  },
  {
    Input: [1, [2, 3]],
    Expected: [1, 2, 3],
    Message: '两层数组',
  },
  {
    Input: [1, [[2, 2], [3, [4]], 5]],
    Expected: [1, 2, 2, 3, 4, 5],
    Message: '四层数组',
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
      console.log('用例 ' + String(i + 1) + ': ' + Message + ' 未通过 ×');
      if (error.code === 'ERR_ASSERTION') {
        console.log('Input:', JSON.stringify(Input));
        console.log('Expected:', JSON.stringify(error.expected));
        console.log('Received:', JSON.stringify(output));
      } else {
        console.log(error);
      }
      break;
    }
    console.log('用例 ' + String(i + 1) + ': ' + Message + ' 通过 √');
  }
})();
