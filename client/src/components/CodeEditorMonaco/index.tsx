import {
  useRef,
  useEffect,
  forwardRef,
  ForwardedRef,
  useImperativeHandle,
} from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import styles from './index.module.less';
import { CodeType } from '~utils/codeType';
import { template } from './const';
import storage from '~utils/storage';
import { CodeStorageKey } from '~constant/storage';
import useWindowSize from 'react-use/lib/useWindowSize';

interface Props {
  type: CodeType;
  themeType: ThemeType;
}

export enum ThemeType {
  'Visual Studio' = 'vs',
  'Visual Studio Dark' = 'vs-dark',
  'High Contrast' = 'hc-light',
  'High Contrast Dark' = 'hc-black',
}

type monacoLang =
  | 'typescript'
  | 'javascript'
  | 'cpp'
  | 'go'
  | 'python'
  | 'java'
  | 'php'
  | 'rust'
  | 'c';

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
};

const Component = (props: Props, ref: ForwardedRef<Expose>) => {
  const { type, themeType } = props;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

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
      const codeCache = storage.get(CodeStorageKey[type]);
      editorRef.current = monaco.editor.create(monacoRef.current, {
        value: codeCache || template[type],
        language: languageMap[type],
        theme: themeType,
        formatOnType: true,
        smoothScrolling: true,
        formatOnPaste: true,
        readOnly: false,
      });

      return () => editorRef.current?.dispose();
    }
  }, [type, themeType]);

  useEffect(() => {
    editorRef.current?.layout();
  }, [width]);

  return <div className={styles.editor} ref={monacoRef}></div>;
};

export default forwardRef(Component);
