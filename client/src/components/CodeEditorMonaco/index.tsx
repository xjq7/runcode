import {
  useRef,
  useEffect,
  forwardRef,
  ForwardedRef,
  useImperativeHandle,
  useState,
} from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import styles from './index.module.less';
import { CodeType } from '~utils/codeType';
import { template } from './const';
import storage from '~utils/storage';
import { CodeStorageKey } from '~constant/storage';
import useWindowSize from 'react-use/lib/useWindowSize';
import { observer } from 'mobx-react-lite';
import EditorConfig from '~store/config/editor';

interface Props {}

type monacoLang =
  | 'typescript'
  | 'javascript'
  | 'cpp'
  | 'go'
  | 'python'
  | 'java'
  | 'php'
  | 'rust'
  | 'c'
  | 'csharp';

export interface Expose {
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
}

const languageMap: Record<CodeType, monacoLang> = {
  [CodeType.nodejs]: 'javascript',
  [CodeType.cpp]: 'cpp',
  [CodeType.go]: 'go',
  [CodeType.python3]: 'python',
  [CodeType.java]: 'java',
  [CodeType.php]: 'php',
  [CodeType.rust]: 'rust',
  [CodeType.c]: 'c',
  [CodeType.dotnet]: 'csharp',
};

const Component = (props: Props, ref: ForwardedRef<Expose>) => {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const [editorConfig] = useState(() => EditorConfig);
  const { editorThemeType, codeType } = editorConfig;

  const monacoRef = useRef(null);
  const { width } = useWindowSize();

  useImperativeHandle(ref, () => ({
    getEditor: () => {
      if (editorRef.current) return editorRef.current;
      return null;
    },
  }));

  useEffect(() => {
    if (monacoRef.current) {
      const codeCache = storage.get(CodeStorageKey[codeType]);
      editorRef.current = monaco.editor.create(monacoRef.current, {
        value: codeCache || template[codeType],
        language: languageMap[codeType],
        theme: editorThemeType,
        formatOnType: true,
        smoothScrolling: true,
        formatOnPaste: true,
        readOnly: false,
      });

      return () => editorRef.current?.dispose();
    }
  }, [codeType, editorThemeType]);

  useEffect(() => {
    editorRef.current?.layout();
  }, [width]);

  return <div className={styles.editor} ref={monacoRef}></div>;
};

export default observer(forwardRef(Component));
