import { CodeType } from '~utils/codeType';

const config_prefix = 'config_';

const code_prefix = 'code_';

export const CodeStorageKey = Object.entries(CodeType).reduce((acc, cur) => {
  acc[cur[1]] = config_prefix + code_prefix + cur[1];
  return acc;
}, {} as Record<CodeType, string>);
