export enum CodeType {
  cpp = 'cpp',
  nodejs = 'nodejs',
  go = 'go',
  python3 = 'python3',
  python2 = 'python2',
  java = 'java',
  php = 'php',
  rust = 'rust',
  c = 'c',
  dotnet = 'dotnet',
  ts = 'typescript',
}

export enum CodeEnv {
  cpp = 'cpp:11',
  nodejs = 'nodejs:lts',
  go = 'go:lts',
  python3 = 'python:3',
  python2 = 'python:2',
  java = 'java:lts',
  php = 'php:8',
  rust = 'rust:lts',
  c = 'cpp:11',
  dotnet = 'mono:lts',
  ts = 'nodejs:lts',
}

export enum FileSuffix {
  cpp = 'cpp',
  nodejs = 'js',
  go = 'go',
  python3 = 'py',
  python2 = 'py',
  java = 'java',
  php = 'php',
  rust = 'rs',
  c = 'c',
  dotnet = 'cs',
  ts = 'ts',
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
