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

export const CodeEnv: Record<string, string> = {
  cpp: 'cpp',
  nodejs: 'nodejs',
  go: 'go',
  python: 'python',
  java: 'java',
  php: 'php',
  rust: 'rust',
  c: 'cpp',
  dotnet: 'dotnet',
  ts: 'nodejs',
};

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
