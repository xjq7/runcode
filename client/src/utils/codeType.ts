export enum CodeType {
  cpp = 'cpp',
  nodejs = 'nodejs',
  go = 'go',
  python = 'python',
  java = 'java',
  php = 'php',
  rust = 'rust',
  c = 'c',
  dotnet = 'dotnet',
  ts = 'typescript',
}

export enum Channel {
  self = 0,
  juejin,
  v2ex,
  'tools.fun',
  github,
  google,
  baidu,
  bing,
}

export const ChannelText = {
  [Channel.self]: '自然流量',
  [Channel.juejin]: '掘金',
  [Channel.v2ex]: 'v2ex',
  [Channel['tools.fun']]: 'tools.fun',
  [Channel.github]: 'Github',
  [Channel.google]: 'Google',
  [Channel.baidu]: 'Baidu',
  [Channel.bing]: 'bing',
};
