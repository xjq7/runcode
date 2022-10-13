import { useRef, useState, useEffect } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
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

const Component = () => {
  useEffect(() => {
    let language = new Compartment(),
      tabSize = new Compartment();

    let state = EditorState.create({
      extensions: [
        basicSetup,
        language.of(javascript()),
        tabSize.of(EditorState.tabSize.of(8)),
      ],
    });

    let view = new EditorView({
      state,
      parent: document.body,
    });
  }, []);
  return <div></div>;
};

export default Component;
