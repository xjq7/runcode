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
import useWindowSize from 'react-use/lib/useWindowSize';
import { observer } from 'mobx-react-lite';
import { ThemeType } from '~store/config/editor';
import classNames from 'classnames';

interface Props {
  className?: string;
  theme?: ThemeType;
  language?: monacoLang;
  code?: string;
  fontSize?: number;
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
  | 'c'
  | 'csharp';

export const languageMap: Record<CodeType, monacoLang> = {
  [CodeType.nodejs]: 'javascript',
  [CodeType.cpp]: 'cpp',
  [CodeType.go]: 'go',
  [CodeType.python3]: 'python',
  [CodeType.python2]: 'python',
  [CodeType.java]: 'java',
  [CodeType.php]: 'php',
  [CodeType.rust]: 'rust',
  [CodeType.c]: 'c',
  [CodeType.dotnet]: 'csharp',
  [CodeType.ts]: 'typescript',
};
export interface Expose {
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
}

const Component = (props: Props, ref: ForwardedRef<Expose>) => {
  const {
    className,
    language = 'cpp',
    theme = ThemeType['Visual Studio'],
    code = '',
    fontSize,
  } = props;
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
    editorRef.current?.setValue(code);
  }, [code]);

  useEffect(() => {
    editorRef.current?.updateOptions({ theme, fontSize });
  }, [theme, fontSize]);

  useEffect(() => {
    if (monacoRef.current) {
      const isUseClangFormat = ['cpp', 'java', 'c', 'csharp'].includes(
        language
      );
      editorRef.current = monaco.editor.create(monacoRef.current, {
        value: code,
        language,
        fontSize,
        theme,
        smoothScrolling: true,
        readOnly: false,
        tabSize: isUseClangFormat ? 2 : 4,
      });
      return () => editorRef.current?.dispose();
    }
  }, [language]);

  useEffect(() => {
    editorRef.current?.layout();
  }, [width]);

  return (
    <div className={classNames(styles.editor, className)} ref={monacoRef}></div>
  );
};

export default observer(forwardRef(Component));
