export function parseConsoleOutput(output: string) {
  if (!output) return [];
  // 换行解析
  let splitAsEnter = output.split(/%0A/).map((str) => decodeURI(str));
  return splitAsEnter;
}
