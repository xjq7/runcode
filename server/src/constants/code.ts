/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
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
  go = 'go:latest',
  python3 = 'python:3',
  python2 = 'python:2',
  java = 'java:latest',
  php = 'php:8',
  rust = 'rust:latest',
  c = 'cpp:11',
  dotnet = 'mono:lts',
  ts = 'nodejs:lts',
}
