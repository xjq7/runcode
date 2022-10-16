export function parseConsoleOutput(output: string) {
  // 换行解析
  let splitAsEnter = output.split(/%0A/).map((str) => decodeURI(str));
  return splitAsEnter;
}
