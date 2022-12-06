import { Channel } from './codeType';

export enum OutputType {
  plain,
  terminal,
}

export function parseConsoleOutput(
  output: string,
  type: OutputType = OutputType.plain
) {
  if (!output) return [];
  // 换行解析
  let splitAsEnter = output.split(/\n|\n\n/).map((str) => {
    if (type === OutputType.plain) {
      str = encodeURI(str);
      str = str.replace(/%1B%5B.*?m.*?%1B%5BK|%1B%5B.*?m|%0D/g, '');
    }

    return decodeURI(str);
  });

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

export function prettierCodeFormat(code: string) {
  if (window.prettier && window.prettierPlugins) {
    try {
      const formatCode = window.prettier.format(code, {
        parser: 'babel',
        plugins: window.prettierPlugins,
        singleQuote: true,
        tabWidth: 4,
      });
      return formatCode;
    } catch (error: any) {
      console.log('js format error', error.message);
    }
  }
  return null;
}

export function parseReferrerToChannel() {
  const referrer = document.referrer;
  if (/juejin\.cn/.test(referrer)) {
    return Channel.juejin;
  } else if (/v2ex\.com/.test(referrer)) {
    return Channel.v2ex;
  } else if (/tools\.fun/.test(referrer)) {
    return Channel['tools.fun'];
  } else if (/github\.com/.test(referrer)) {
    return Channel.github;
  } else if (/google\.com/.test(referrer)) {
    return Channel.google;
  } else if (/baidu\.com/.test(referrer)) {
    return Channel.baidu;
  } else if (/bing\.com/.test(referrer)) {
    return Channel.bing;
  }
}
