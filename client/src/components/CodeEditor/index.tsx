import {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { basicSetup, EditorView } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { CodeType } from './type';
import styles from './index.module.less';

interface Props {
  type?: CodeType;
}

export interface Expose {
  getState(): string;
}

const Component = (props: Props, ref: ForwardedRef<Expose>) => {
  const { type } = props;

  const viewRef = useRef<EditorView>();

  useImperativeHandle(ref, () => ({
    getState: () => {
      if (viewRef.current) return viewRef.current.state.doc.toJSON().join('\n');
      return '';
    },
  }));

  useEffect(() => {
    let language = new Compartment(),
      tabSize = new Compartment();
    let myTheme = EditorView.theme(
      {
        '&': {
          color: 'black',
          backgroundColor: 'white',
        },
        '.cm-scroller': {
          border: '1px solid #e5e5e5',
        },
        '.cm-content': {
          width: '800px',
          height: '600px',
        },
      },
      { dark: false }
    );

    let state = EditorState.create({
      extensions: [
        basicSetup,
        language.of(javascript()),
        tabSize.of(EditorState.tabSize.of(8)),
        myTheme,
      ],
    });

    const content = document.querySelector('#editor');

    if (!content) return;

    let view = new EditorView({
      state,
      parent: content,
    });
    viewRef.current = view;

    return () => view.destroy();
  }, []);
  return <div id="editor" className={styles.editor}></div>;
};

export default forwardRef(Component);
