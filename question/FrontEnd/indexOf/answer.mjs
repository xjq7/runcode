// 子串 next 数组
function next(substr) {
  const _next = new Array(substr.length).fill(0);
  let j = -1,
    i = 0;

  while (i < substr.length) {
    if (j == -1 || substr[i] == substr[j]) {
      j++;
      i++;
      _next[i] = j;
    } else {
      j = -1;
    }
  }
  return _next;
}

export default function Kmp(str, substr) {
  let i = 0,
    j = 0;
  const _next = next(substr);
  while (i < str.length && j < substr.length) {
    if (str[i] == substr[j]) {
      i++;
      j++;
    } else if (j != 0) {
      j = _next[j];
    } else {
      i++;
    }
  }
  return j == substr.length ? i - j : -1;
}
