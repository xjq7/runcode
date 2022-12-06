export enum CodeType {
  cpp = 'cpp',
  nodejs = 'nodejs',
  go = 'go',
  python3 = 'python3',
  java = 'java',
  php = 'php',
  rust = 'rust',
  c = 'c',
  dotnet = 'dotnet',
}

export enum CodeEnv {
  cpp = 'cpp:11',
  nodejs = 'nodejs:lts',
  go = 'go:latest',
  python3 = 'python:3',
  java = 'java:latest',
  php = 'php:8',
  rust = 'rust:latest',
  c = 'cpp:11',
  dotnet = 'mono:lts',
}

export enum FileSuffix {
  cpp = 'cpp',
  nodejs = 'js',
  go = 'go',
  python3 = 'py',
  java = 'java',
  php = 'php',
  rust = 'rs',
  c = 'c',
  dotnet = 'cs',
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
