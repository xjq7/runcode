import {
  useRef,
  useEffect,
  forwardRef,
  ForwardedRef,
  useImperativeHandle,
} from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import styles from './index.module.less';
import { CodeType } from '~utils/type';
import { template } from './const';

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

type monacoLang = 'typescript' | 'javascript' | 'cpp' | 'go' | 'shell';

export interface Expose {
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
}

const languageMap: Record<CodeType, monacoLang> = {
  [CodeType.nodejs]: 'javascript',
  [CodeType.cpp]: 'cpp',
  [CodeType.go]: 'go',
  [CodeType.bash]: 'shell',
  [CodeType.shell]: 'shell',
};

const Component = (props: Props, ref: ForwardedRef<Expose>) => {
  const { type, themeType } = props;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const monacoRef = useRef(null);

  useImperativeHandle(ref, () => ({
    getEditor: () => {
      if (editorRef.current) return editorRef.current;
      return null;
    },
  }));

  useEffect(() => {
    if (monacoRef.current) {
      editorRef.current = monaco.editor.create(monacoRef.current, {
        value: template[type],
        language: languageMap[type],
        theme: themeType,
      });

      return () => editorRef.current?.dispose();
    }
  }, [type, themeType]);

  return <div className={styles.editor} ref={monacoRef}></div>;
};

export default forwardRef(Component);
