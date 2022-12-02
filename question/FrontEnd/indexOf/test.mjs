import f from './answer.mjs';
import { it } from 'mocha';
import { assert } from 'chai';

it("用例 1: 输入 'hello world', 'l'", () => {
  assert.deepEqual(f('hello world', 'l'), 2);
});

it("用例 2: 输入 'hello world', 'ol'", () => {
  assert.deepEqual(f('hello world', 'ol'), -1);
});

it("用例 3: 输入 'hello world', 'world'", () => {
  assert.deepEqual(f('hello world', 'world'), 6);
});

it("用例 4: 输入 'hello world', ' '", () => {
  assert.deepEqual(f('hello world', ' '), 5);
});

it("用例 5: 输入 'There is magic in the trying and learning and trying again.. but any unprocessed PTSD will come back to haunt you', 'PTSD'", () => {
  assert.deepEqual(
    f(
      'There is magic in the trying and learning and trying again.. but any unprocessed PTSD will come back to haunt you',
      'PTSD'
    ),
    81
  );
});

it("用例 6: 输入 '', ' '", () => {
  assert.deepEqual(f('', ' '), -1);
});
