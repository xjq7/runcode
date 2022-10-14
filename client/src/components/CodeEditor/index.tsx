import { useEffect } from 'react';
import styles from './index.module.less';

// export const Editor: React.FunctionComponent = () => {
//   const [editor, setEditor] =
//     useState<monaco.editor.IStandaloneCodeEditor | null>(null);
//   const monacoEl = useRef(null);

//   useEffect(() => {
//     if (monacoEl && !editor) {
//       setEditor(
//         monaco.editor.create(monacoEl.current!, {
//           value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join(
//             '\n'
//           ),
//           language: 'cpp',
//         })
//       );
//     }

//     return () => editor?.dispose();
//   }, [monacoEl.current]);

//   return <div className={styles.Editor} ref={monacoEl}></div>;
// };

import { basicSetup, EditorView } from 'codemirror';
import { EditorState, Compartment } from '@codemirror/state';
import { javascript } from '@codemirror/lang-javascript';
import { CodeType } from './type';

interface Props {
  type?: CodeType;
}

const Component = (props: Props) => {
  useEffect(() => {
    let language = new Compartment(),
      tabSize = new Compartment();
    let myTheme = EditorView.theme(
      {
        '&': {
          color: 'black',
          backgroundColor: 'white',
        },
        '.cm-content': {
          width: '600px',
          height: '800px',
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

    return () => view.destroy();
  }, []);
  return <div id="editor" className={styles.editor}></div>;
};

export default Component;
