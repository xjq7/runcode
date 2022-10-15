import { useRef } from 'react';
import Editor, { Expose } from '~/components/CodeEditor';
import { runCode } from './service';
import styles from './index.module.less';
import { useRequest } from 'ahooks';
import Button from '~/components/Button';
import { toast } from '~/components/Toast';

const Component = () => {
  const editorRef = useRef<Expose>(null);

  const { data, error, run, loading } = useRequest(runCode, { manual: true });

  const handleRunCode = async () => {
    if (editorRef.current) {
      const code = editorRef.current.getState();
      run({ code: encodeURI(code), type: 'go' });
      toast({ message: '2222' });
    }
  };

  return (
    <div className={styles.container}>
      <Editor ref={editorRef} />
      <div className={styles.operator}>
        <Button type="primary" size="sm" onClick={handleRunCode}>
          run
        </Button>
      </div>
    </div>
  );
};

export default Component;
