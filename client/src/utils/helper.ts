export function parseConsoleOutput(output: string) {
  // 颜色代码干掉
  output = output.replace(/%1B%5B.*?m.*?%1B%5BK|%1B%5B.*?m/g, '');

  // 换行解析
  let splitAsEnter = output.split(/%0D%0A|%0A/).map((str) => decodeURI(str));
  return splitAsEnter;
}
