import { CodeType } from '~utils/codeType';

const config_prefix = 'config_';

const code_prefix = 'code_';

export const CodeStorageKey = Object.entries(CodeType).reduce((acc, cur) => {
  acc[cur[1]] = config_prefix + code_prefix + cur[1];
  return acc;
}, {} as Record<string, string>);

export function getCodeStorageKey(codeType: CodeType, codeVersion: string) {
  return config_prefix + code_prefix + codeType + '_' + codeVersion;
}
