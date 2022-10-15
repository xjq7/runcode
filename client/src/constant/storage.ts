import { CodeType } from '~utils/type';

const config_prefix = 'config_';

const code_prefix = 'code_';

export const CodeStorageKey: Record<CodeType, string> = {
  [CodeType.cpp]: config_prefix + code_prefix + CodeType.cpp,
  [CodeType.nodejs]: config_prefix + code_prefix + CodeType.nodejs,
  [CodeType.bash]: config_prefix + code_prefix + CodeType.bash,
  [CodeType.go]: config_prefix + code_prefix + CodeType.go,
  [CodeType.shell]: config_prefix + code_prefix + CodeType.shell,
};

export const ThemeStorageKey = config_prefix + 'theme_';

export const CodeStorageTypeKey = config_prefix + code_prefix + 'type_';
