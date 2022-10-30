import { useRef } from 'react';
import Editor, { Expose } from '~components/CodeEditorMonaco';
import styles from './index.module.less';
import Header from './components/Header';
import Operator from './components/Operator';
import classNames from 'classnames';

const Component = () => {
  const editorRef = useRef<Expose>(null);

  const getEditor = () => {
    return editorRef.current?.getEditor();
  };

  return (
    <div className={classNames(styles.container, 'bg-primary-content')}>
      <Header />
      <Editor ref={editorRef} />
      <Operator getEditor={getEditor} />
    </div>
  );
};

export default Component;
