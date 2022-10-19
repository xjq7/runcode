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
import classnames from 'classnames';
import { template } from '~components/CodeEditorMonaco/const';
import { debounce } from 'lodash';
import { toast } from '~components/Toast';

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
  const [timesPrevent, setTimesPrevent] = useState(false);

  const handleRunCode = async () => {
    if (timesPrevent) {
      toast({ message: '您点击太快啦! 请稍后重试!', type: 'info' });
      return;
    }
    if (editorRef.current) {
      const code = editorRef.current.getEditor()?.getValue() || '';
      run({ code: encodeURI(code), type: codeType, stdin: inputRef.current });
      setTimesPrevent(true);
      setTimeout(() => {
        setTimesPrevent(false);
      }, 2000);
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

  useEffect(() => {
    editorRef.current
      ?.getEditor()
      ?.getModel()
      ?.onDidChangeContent(
        debounce(() => {
          storage.set(
            CodeStorageKey[codeType],
            editorRef.current?.getEditor()?.getValue()
          );
        }, 3000)
      );
  }, []);

  const renderInput = () => {
    return (
      <TextArea
        onChange={(e) => {
          inputRef.current = e.target.value;
        }}
        className={classnames(styles.input, 'mt-1')}
        style={{ display: display === DisplayType.input ? 'block' : 'none' }}
        placeholder="stdin..."
        border
      />
    );
  };

  const renderOutput = () => {
    return (
      <div
        className={classnames(styles.output, 'mt-1', 'text-gray-600')}
        style={{ display: display === DisplayType.output ? 'block' : 'none' }}
      >
        {loading ? (
          'running...'
        ) : output.length ? (
          output.map((str, index) => (
            <pre className="text-gray-800" key={index}>
              {str}
            </pre>
          ))
        ) : (
          <span className="text-sm text-gray-400">output...</span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div
        className={classnames(
          styles.header,
          'flex flex-row items-center justify-between'
        )}
      >
        <div className="flex-row">
          <Select<CodeType>
            className="w-30"
            size="md"
            options={codeOptions}
            value={codeType}
            onChange={handleCodeOptionsChange}
          />
          <Select<ThemeType>
            className="w-42 ml-4"
            size="md"
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
            className={classnames(styles.github, 'w-7 mr-2')}
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
          className="mr-2"
          onClick={() => {
            editorRef.current?.getEditor()?.setValue(template[codeType]);
          }}
        >
          reset
        </Button>
        <Button
          type="primary"
          size="sm"
          className="mr-2"
          loading={loading}
          onClick={handleRunCode}
        >
          run
        </Button>
      </div>

      <div className={classnames(styles.display)}>
        <Tab<DisplayType>
          tabs={[
            { label: '输入', value: DisplayType.input },
            { label: '输出', value: DisplayType.output },
          ]}
          active={display}
          lifted
          size="md"
          onChange={(type) => setDisplay(type)}
        />

        {renderInput()}
        {renderOutput()}
      </div>
    </div>
  );
};

export default Component;
