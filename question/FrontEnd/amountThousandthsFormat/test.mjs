import assert from 'assert';
import _deepClone from './answer.mjs';
import f from './index.mjs';

const circle1 = { foo: 1 };
const circle2 = { bar: 2, c1: circle1 };
circle1.c2 = circle2;

const cases = [
  {
    Input: '314',
    Expected: '314',
    Message: '314 原样输出',
  },
  {
    Input: '31415926',
    Expected: '31,415,926',
    Message: '输入 31415926 输出 3,1415,926',
  },
  {
    Input: '31415926.62',
    Expected: '31,415,926.62',
    Message: '带小数位: 输入 31415926.62 输出 31,415,926.62',
  },
  {
    Input: '31415926.629514',
    Expected: '31,415,926.629514',
    Message: '带长小数位: 输入 31415926.629514 输出 31,415,926.629514',
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
