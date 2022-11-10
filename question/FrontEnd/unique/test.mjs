import assert from 'assert';
import unique from './index.mjs';

const cases = [
  {
    Input: [1, 2, 3],
    Expected: [1, 2, 3],
    Message: '无重复数字',
  },
  {
    Input: [1, 2, 3, 3],
    Expected: [1, 2, 3],
    Message: '单个重复数字',
  },
  {
    Input: [1, 1, 2, 2, 2, 3, 3],
    Expected: [1, 2, 3],
    Message: '多个重复数字',
  },
];

(function () {
  for (let i = 0; i < cases.length; i++) {
    const { Input, Expected, Message } = cases[i];
    let output;
    try {
      output = unique(Input);
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
