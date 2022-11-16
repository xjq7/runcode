import assert from 'assert';
import f from './index.mjs';

const add = (...args) => args.reduce((a, b) => a + b, 0);
const multi = (...args) => args.reduce((a, b) => a * b, 1);

const cases = [
  {
    Input: [add, [1], [2], [3], null],
    Expected: [true, null, null, null, 6],
    Message: '加法函数柯里化一',
  },
  {
    Input: [add, [1, 2, 1], null, null, null],
    Expected: [true, null, 4, 4, 4],
    Message: '加法函数柯里化二',
  },
  {
    Input: [add, [1, 2, 1], null, [1, 2], null],
    Expected: [true, null, 4, null, 7],
    Message: '加法函数柯里化三',
  },
  {
    Input: [multi, [100], null, [1, 2], null],
    Expected: [true, null, 100, null, 200],
    Message: '乘法函数柯里化一',
  },
];

(function () {
  for (let i = 0; i < cases.length; i++) {
    const { Input, Expected, Message } = cases[i];
    const output = [];
    try {
      let curry;
      Input.forEach((arg) => {
        let result;
        if (!curry) {
          curry = f(arg);
          result = !!curry;
        } else if (arg) {
          result = curry(...arg);
        } else {
          result = curry();
        }
        output.push(result);
      });

      assert.deepEqual(output, Expected);
    } catch (error) {
      console.log('用例 ' + String(i + 1) + ': ' + Message + ' 未通过');
      if (error.code === 'ERR_ASSERTION') {
        console.log('Input:', Input);
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
