import assert from 'assert';
import _deepClone from './answer.mjs';
import f from './index.mjs';

const circle1 = { foo: 1 };
const circle2 = { bar: 2, c1: circle1 };
circle1.c2 = circle2;

const cases = [
  {
    Input: [{ f: 1 }],
    Expected: [{ f: 1 }],
    Message: '一层对象',
  },
  {
    Input: [1, 2, { a: 1 }],
    Expected: [1, 2, { a: 1 }],
    Message: '两层对象',
  },
  {
    Input: { b: [{ c: 1, d: [{ d: 1, f: 2 }] }] },
    Expected: { b: [{ c: 1, d: [{ d: 1, f: 2 }] }] },
    Message: '两层对象, 且修改返回值属性',
    callback: function (i) {
      const originInput = _deepClone(this.Input);
      try {
        const output = f(this.Input);
        output['1'] = Math.random();
        assert.deepEqual(this.Input, originInput);
        return true;
      } catch (error) {
        if (error.code === 'ERR_ASSERTION') {
          console.log(
            '用例 ' + String(i + 1) + ': ' + this.Message + ' 未通过 ×'
          );
          console.log(
            '修改输出对象属性后的输入对象: ',
            JSON.stringify(this.Input)
          );
          console.log('原输入对象: ', JSON.stringify(originInput));
        } else {
          console.log(error);
        }
      }
    },
  },
  {
    Input: circle1,
    Expected: { foo: 1, c2: { bar: 2, c1: {} } },
    Message: '存在循环引用',
    callback: function (i) {
      try {
        const output = f(this.Input);
        assert.deepEqual(output, this.Expected);
        return true;
      } catch (error) {
        console.log(
          '用例 ' + String(i + 1) + ': ' + this.Message + ' 未通过 ×'
        );
        console.log(error);
      }
    },
  },
];

(function () {
  for (let i = 0; i < cases.length; i++) {
    const { Input, Expected, Message, callback } = cases[i];
    if (callback) {
      if (!cases[i].callback(i)) {
        break;
      }
    } else {
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
    }

    console.log('用例 ' + String(i + 1) + ': ' + Message + ' 通过 √');
  }
})();
