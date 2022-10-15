import { useMemo, useRef, useState } from 'react';
import Editor, { Expose, ThemeType } from '~components/CodeEditorMonaco';
import { runCode } from './service';
import styles from './index.module.less';
import { useRequest } from 'ahooks';
import Button from '~components/Button';
import Select, { IOption } from '~components/Select';
import { CodeType } from '../../../../common/type';

const codeOptions: IOption<CodeType>[] = [
  { label: 'C++', value: CodeType.cpp },
  { label: 'Nodejs', value: CodeType.nodejs },
  { label: 'Go', value: CodeType.go },
  { label: 'Bash', value: CodeType.bash },
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

const Component = () => {
  const editorRef = useRef<Expose>(null);

  const { data, run, loading } = useRequest(runCode, { manual: true });

  const output = useMemo(() => {
    if (data?.output) return decodeURI(data?.output);
    return '';
  }, [data]);

  const [codeType, setCodeType] = useState(CodeType.cpp);
  const [themeType, setThemeType] = useState<ThemeType>(
    ThemeType['Visual Studio']
  );

  const handleRunCode = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getEditor()?.getValue() || '';
      run({ code: encodeURI(code), type: codeType });
    }
  };

  const handleCodeOptionsChange = (data: CodeType) => {
    setCodeType(data);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
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
          onChange={(data: ThemeType) => setThemeType(data)}
        />
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
      <div className={styles.output}>
        <span>{loading ? 'running...' : output}</span>
      </div>
    </div>
  );
};

export default Component;
