import classnames from 'classnames';
import { CodeType } from '~utils/codeType';
import EditorConfig, { ThemeType } from '~store/config/editor';
import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Select } from 'antd';
import { DefaultOptionType } from 'antd/es/select';

const codeOptions: DefaultOptionType[] = [
  { label: 'C++', value: CodeType.cpp },
  { label: 'C', value: CodeType.c },
  { label: 'Java', value: CodeType.java },
  { label: 'Rust', value: CodeType.rust },
  { label: 'Nodejs', value: CodeType.nodejs },
  { label: 'Go', value: CodeType.go },
  { label: 'C#', value: CodeType.dotnet },
  { label: 'Python', value: CodeType.python },
  { label: 'php', value: CodeType.php },
  { label: 'Typescript', value: CodeType.ts },
];

const versionOptions: DefaultOptionType[][] = [
  [
    { label: '14.2', value: '14.2' },
    { label: '11.5', value: '11.5' },
  ],
  [
    { label: 'gcc 14', value: '14.2' },
    { label: 'gcc 11', value: '11.5' },
  ],
  [
    {
      label: '8',
      value: '8',
    },
    {
      label: '11',
      value: '11',
    },
    {
      label: '17',
      value: '17',
    },
    {
      label: '20',
      value: '20',
    },
  ],
  [
    {
      label: '1.83.0',
      value: '1.83.0',
    },
  ],
  [
    {
      label: '22',
      value: '22',
    },
    {
      label: '20',
      value: '20',
    },
    {
      label: '18',
      value: '18',
    },
    {
      label: '16',
      value: '16',
    },
  ],
  [
    {
      label: '1.23',
      value: '1.23',
    },
    {
      label: '1.20',
      value: '1.20',
    },
    {
      label: '1.18',
      value: '1.18',
    },
  ],
  [
    {
      label: '6.12',
      value: '6.12',
    },
  ],
  [
    {
      label: '3.9.18',
      value: '3.9.18',
    },
    {
      label: '2.7.18',
      value: '2.7.18',
    },
  ],
  [
    {
      label: '8.4',
      value: '8.4',
    },
    {
      label: '7.4',
      value: '7.4',
    },
  ],
  [
    {
      label: '5.7.2',
      value: '5.7.2',
    },
  ],
];

const themeOptions: DefaultOptionType[] = [
  {
    label: 'Visual Studio',
    value: ThemeType['Visual Studio'],
  },
  {
    label: 'Visual Studio Dark',
    value: ThemeType['Visual Studio Dark'],
  },
  {
    label: 'High Contrast light',
    value: ThemeType['High Contrast'],
  },
  {
    label: 'High Contrast Dark',
    value: ThemeType['High Contrast Dark'],
  },
];

function Component() {
  const [editorConfig] = useState(() => EditorConfig);

  const {
    codeType,
    codeVersion,
    editorThemeType,
    setCodeType,
    setCodeVersion,
    setEditorThemeType,
  } = editorConfig;

  const codeVersionOptions = useMemo(() => {
    const index =
      codeOptions.findIndex((option) => option.value === codeType) || 0;

    if (versionOptions[index]) {
      setCodeVersion(versionOptions[index][0].value as string);
    }
    return versionOptions[index];
  }, [codeType]);

  return (
    <div
      className={classnames(
        'pt-3 pb-2 mt-2',
        'flex flex-row items-center justify-between'
      )}
    >
      <div className="flex-row">
        <Select<CodeType>
          className="w-32 ml-2"
          options={codeOptions}
          size="large"
          value={codeType}
          onChange={(type) => setCodeType(type)}
        />
        <Select
          className="w-32 ml-2"
          options={codeVersionOptions}
          size="large"
          value={codeVersion}
          onChange={(type) => setCodeVersion(type)}
        />
        <Select<ThemeType>
          className="w-40 ml-4"
          size="large"
          options={themeOptions}
          value={editorThemeType}
          onChange={(type) => setEditorThemeType(type)}
        />
      </div>
    </div>
  );
}

export default observer(Component);
