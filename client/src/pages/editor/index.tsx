import { useRef, useState } from 'react';
import Editor, { Expose } from '~components/CodeEditorMonaco';
import styles from './index.module.less';
import Drawer from '~components/Drawer';
import SettingSidebar from './components/SettingSidebar';
import { observer } from 'mobx-react-lite';
import EditorConfig from '~store/config/editor';
import Header, { settingDrawerId } from './components/Header';
import Operator from './components/Operator';

const Component = observer(() => {
  const editorRef = useRef<Expose>(null);

  const [editorConfig] = useState(() => EditorConfig);
  const {
    autoSaveDelay,
    codeType,
    editorThemeType,
    setCodeType,
    setEditorThemeType,
  } = editorConfig;

  const getEditor = () => {
    return editorRef.current?.getEditor();
  };

  return (
    <Drawer id={settingDrawerId} Sidebar={SettingSidebar} className="w-80">
      <div className={styles.container}>
        <Header
          codeType={codeType}
          themeType={editorThemeType}
          onCodeTypeChange={(type) => {
            setCodeType(type);
          }}
          onThemeTypeChange={(type) => {
            setEditorThemeType(type);
          }}
        />
        <Editor ref={editorRef} type={codeType} themeType={editorThemeType} />
        <Operator
          codeType={codeType}
          getEditor={getEditor}
          autoSaveDelay={autoSaveDelay}
        />
      </div>
    </Drawer>
  );
});

export default Component;
