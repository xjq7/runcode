import { CodeType } from '~utils/type';

export const codeKey: Record<CodeType, string> = {
  [CodeType.cpp]: 'code_' + CodeType.cpp,
  [CodeType.nodejs]: 'code_' + CodeType.nodejs,
  [CodeType.bash]: 'code_' + CodeType.bash,
  [CodeType.go]: 'code_' + CodeType.go,
  [CodeType.shell]: 'code_' + CodeType.shell,
};
