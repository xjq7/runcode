import assert from 'assert';
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function _deepClone(obj, weakMap = new WeakMap()) {
  const type = Object.prototype.toString.call(obj);
  if (!(type === '[object Object]' || type === '[object Array]')) return obj;
  const o = type === '[object Object]' ? {} : [];
  if (weakMap.get(obj)) return o;
  weakMap.set(obj, true);
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      o[key] = deepClone(obj[key]);
    }
  }
  return o;
}

const cases = [
  {
    Input: [1, 2, { a: 1 }],
    Expected: [1, 2, { a: 1 }],
    Message: '两层对象',
  },
  {
    Input: [{ f: 1 }],
    Expected: [{ f: 1 }],
    Message: '一层对象',
  },
  {
    Input: { b: [{ c: 1, d: [{ d: 1, f: 2 }] }] },
    Expected: { b: [{ c: 1, d: [{ d: 1, f: 2 }] }], a: 1 },
    Message: '两层对象, 修改返回值',
  },
];

(function () {
  for (let i = 0; i < cases.length; i++) {
    const { Input, Expected, Message } = cases[i];
    let output;
    try {
      output = deepClone(Input);
      assert.deepEqual(Input, Expected);
    } catch (error) {
      console.log('用例 ' + String(i + 1) + ': ' + Message + ' 未通过');
      if (error.code === 'ERR_ASSERTION') {
        console.log('Input:', JSON.stringify(error.actual));
        console.log('Expected:', JSON.stringify(error.expected));
        console.log('Received:', JSON.stringify(output));
      } else {
        console.log(error);
      }
      break;
    }
    const originInput = _deepClone(Input);
    try {
      output['1'] = Math.random();
      assert.deepEqual(Input, originInput);
    } catch (error) {
      if (error.code === 'ERR_ASSERTION') {
        console.log('用例 ' + String(i + 1) + ': ' + Message + ' 未通过');
        console.log(
          'Mutate Output Expected Input: ',
          JSON.stringify(originInput)
        );
        console.log('Input: ', JSON.stringify(Input));
      } else {
        console.log(error);
      }
      break;
    }
    console.log('用例 ' + String(i + 1) + ': ' + Message + ' 通过');
  }
})();
