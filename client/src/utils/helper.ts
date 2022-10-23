export function parseConsoleOutput(output: string) {
  if (!output) return [];
  // 换行解析
  let splitAsEnter = output.split(/%0A/).map((str) => decodeURI(str));
  return splitAsEnter;
}

export function saveAsFile(msg: string) {
  const blob = new Blob([msg], {
    type: 'text/plain',
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'output.txt';
  document.documentElement.appendChild(a);
  a.click();
  document.documentElement.removeChild(a);
}
