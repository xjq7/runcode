import { useRef, useState } from 'react';
import Editor, { Expose } from '~components/CodeEditor';
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
];

const Component = () => {
  const editorRef = useRef<Expose>(null);

  const { data, run, loading } = useRequest(runCode, { manual: true });

  const { output = '' } = data || {};

  const [codeType, setCodeType] = useState(CodeType.cpp);

  const handleRunCode = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getState();
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
          options={codeOptions}
          value={codeType}
          onChange={handleCodeOptionsChange}
        />
      </div>

      <Editor ref={editorRef} type={codeType} />
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
        <span>{output}</span>
      </div>
    </div>
  );
};

export default Component;
