import { useCallback, useEffect, useRef, useState } from 'react';
import Editor, { Expose, languageMap } from '~components/CodeEditorMonaco';
import styles from './index.module.less';
import Header from './components/Header';
import Operator from './components/Operator';
import classNames from 'classnames';
import EditorConfig from '~store/config/editor';
import { observer } from 'mobx-react-lite';
import storage from '~utils/storage';
import { getCodeStorageKey } from '~constant/storage';
import { template } from '~components/CodeEditorMonaco/const';

const Component = () => {
  const editorRef = useRef<Expose>(null);

  const [editorConfig] = useState(() => EditorConfig);
  const { editorThemeType, codeType, codeVersion, fontSize } = editorConfig;

  const getEditor = useCallback(() => {
    return editorRef.current?.getEditor();
  }, [editorRef.current]);

  useEffect(() => {
    const codeEnv = `${codeType}:${codeVersion}`;
    let codeCache = storage.get(getCodeStorageKey(codeType, codeVersion));

    if (!codeCache) {
      codeCache = template[codeEnv] || template[codeType];
    }
    getEditor()?.setValue(codeCache);
  }, [codeType, codeVersion, getEditor]);

  return (
    <div className={classNames(styles.container, 'bg-primary-content')}>
      <Header />
      <Editor
        ref={editorRef}
        theme={editorThemeType}
        language={languageMap[codeType]}
        fontSize={fontSize}
      />
      <Operator getEditor={getEditor} />
    </div>
  );
};

export default observer(Component);
