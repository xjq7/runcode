import classnames from 'classnames';
import { ThemeType } from '~components/CodeEditorMonaco';
import Iconfont from '~components/Iconfont';
import { CodeType } from '~utils/codeType';
import Select, { IOption } from '~components/Select';

const codeOptions: IOption<CodeType>[] = [
  { label: 'C++', value: CodeType.cpp },
  { label: 'C', value: CodeType.c },
  { label: 'Java', value: CodeType.java },
  { label: 'Rust', value: CodeType.rust },
  { label: 'Nodejs', value: CodeType.nodejs },
  { label: 'Go', value: CodeType.go },
  { label: 'Python3', value: CodeType.python3 },
  { label: 'php', value: CodeType.php },
];

const themeOptions: IOption<ThemeType>[] = [
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

interface Props {
  codeType: CodeType;
  themeType: ThemeType;
  onCodeTypeChange(t: CodeType): void;
  onThemeTypeChange(t: ThemeType): void;
}

export const settingDrawerId = 'editor-setting';

function Component(props: Props) {
  const { codeType, themeType, onCodeTypeChange, onThemeTypeChange } = props;
  return (
    <div
      className={classnames(
        'mt-4 mb-3',
        'flex flex-row items-center justify-between'
      )}
    >
      <div className="flex-row">
        <Select<CodeType>
          className="w-30 ml-2"
          size="md"
          options={codeOptions}
          value={codeType}
          onChange={onCodeTypeChange}
        />
        <Select<ThemeType>
          className="w-42 ml-4"
          size="md"
          options={themeOptions}
          value={themeType}
          onChange={onThemeTypeChange}
        />
      </div>
      <div>
        <label htmlFor={settingDrawerId}>
          <Iconfont name="setting" size={24} className={classnames('w-7 ')} />
        </label>
        <Iconfont
          name="github"
          size={24}
          className={classnames('w-7 mr-2 ml-4')}
          onClick={() => {
            window.open('https://github.com/xjq7/runcode');
          }}
        />
      </div>
    </div>
  );
}

export default Component;
