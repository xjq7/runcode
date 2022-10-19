import { useEffect, useMemo, useRef, useState } from 'react';
import Editor, { Expose, ThemeType } from '~components/CodeEditorMonaco';
import { runCode } from './service';
import styles from './index.module.less';
import { useRequest } from 'ahooks';
import Button from '~components/Button';
import Select, { IOption } from '~components/Select';
import { CodeType } from '~utils/type';
import storage from '~utils/storage';
import {
  CodeStorageKey,
  CodeStorageTypeKey,
  ThemeStorageKey,
} from '~constant/storage';
import { parseConsoleOutput } from '~utils/helper';
import Tab from '~components/Tab';
import TextArea from '~components/Textarea';
import GithubIcon from '../../assets/github.png';
import cls from 'classnames';

const codeOptions: IOption<CodeType>[] = [
  { label: 'C++', value: CodeType.cpp },
  { label: 'Nodejs', value: CodeType.nodejs },
  { label: 'Go', value: CodeType.go },
  { label: 'Bash', value: CodeType.bash },
  { label: 'Python3', value: CodeType.python3 },
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

enum DisplayType {
  input,
  output,
}

const initThemeType =
  storage.get(ThemeStorageKey) || ThemeType['Visual Studio'];
const initCodeType = storage.get(CodeStorageTypeKey) || CodeType.cpp;

const Component = () => {
  const editorRef = useRef<Expose>(null);
  const inputRef = useRef('');

  const [display, setDisplay] = useState(DisplayType.output);

  const { data, run, loading } = useRequest(runCode, { manual: true });

  const output = useMemo(() => {
    let output = '';
    if (data?.code) {
      output = data?.message || '';
    } else {
      output = data?.output || '';
    }
    return parseConsoleOutput(output);
  }, [data]);

  const [codeType, setCodeType] = useState<CodeType>(initCodeType);
  const [themeType, setThemeType] = useState<ThemeType>(initThemeType);

  const handleRunCode = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getEditor()?.getValue() || '';
      storage.set(CodeStorageKey[codeType], code);
      run({ code: encodeURI(code), type: codeType, stdin: inputRef.current });
    }
  };
  useEffect(() => {
    if (loading) {
      setDisplay(DisplayType.output);
    }
  }, [loading]);

  const handleCodeOptionsChange = (data: CodeType) => {
    storage.set(CodeStorageTypeKey, data);
    setCodeType(data);
  };

  const renderInput = () => {
    return (
      <TextArea
        onChange={(e) => {
          inputRef.current = e.target.value;
        }}
        className={styles.input}
        style={{ display: display === DisplayType.input ? 'block' : 'none' }}
        placeholder=""
        border
      />
    );
  };
  const renderOutput = () => {
    return (
      <div
        className={styles.output}
        style={{ display: display === DisplayType.output ? 'block' : 'none' }}
      >
        {loading
          ? 'running...'
          : output.map((str, index) => <pre key={index}>{str}</pre>)}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div
        className={cls(
          styles.header,
          'flex flex-row items-center justify-between'
        )}
      >
        <div className="flex-row">
          <Select<CodeType>
            className="w-32"
            options={codeOptions}
            value={codeType}
            onChange={handleCodeOptionsChange}
          />
          <Select<ThemeType>
            className="w-64 ml-4"
            options={themeOptions}
            value={themeType}
            onChange={(data: ThemeType) => {
              storage.set(ThemeStorageKey, data);
              setThemeType(data);
            }}
          />
        </div>
        <div>
          <img
            className={cls(styles.github, 'w-7')}
            src={GithubIcon}
            onClick={() => {
              window.open('https://github.com/xjq7/runcode');
            }}
          />
        </div>
      </div>

      <Editor ref={editorRef} type={codeType} themeType={themeType} />
      <div className={styles.operator}>
        <Button
          type="primary"
          size="sm"
          loading={loading}
          onClick={handleRunCode}
        >
          run
        </Button>
      </div>
      <Tab<DisplayType>
        tabs={[
          { label: '输入', value: DisplayType.input },
          { label: '输出', value: DisplayType.output },
        ]}
        active={display}
        onChange={(type) => setDisplay(type)}
      />

      <div className={styles.display}>
        {renderInput()}
        {renderOutput()}
      </div>
    </div>
  );
};

export default Component;
