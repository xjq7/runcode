import { useEffect, useMemo, useRef, useState } from 'react';
import Editor, { Expose, languageMap } from '~components/CodeEditorMonaco';
import { marked } from 'marked';
import styles from './index.module.less';
import { ThemeType } from '~store/config/editor';
import { CodeType } from '~utils/codeType';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import classNames from 'classnames';
import Button from '~components/Button';
import { useSearchParams } from 'react-router-dom';
import { exec, getQuestion, IQuestion } from '~services/question';
import { debounce } from 'lodash';
import EditorConfig from '~store/config/editor';
import storage from '~utils/storage';
import { CodeStorageKey } from '~constant/storage';
import PageSpinner from '~components/PageSpinner';
import { parseConsoleOutput, prettierCodeFormat } from '~utils/helper';
import Tabs from '~components/Tabs';

enum Introduce {
  question,
  answer,
}

function Question() {
  const [searchParams] = useSearchParams();
  const [detail, setDetail] = useState<IQuestion>();
  const [output, setOutput] = useState<string[]>([]);

  const [submitLoading, setSubmitLoading] = useState(false);

  const name = searchParams.get('name');
  const editorRef = useRef<Expose>(null);

  const [showOutput, setShowOutput] = useState(false);

  const [introduce, setIntroduce] = useState(Introduce.question);

  const [editorConfig] = useState(() => EditorConfig);
  const { autoSaveDelay } = editorConfig;

  const title = useMemo(() => {
    const name = detail?.name;
    return name;
  }, [detail]);

  const getEditor = () => {
    return editorRef.current?.getEditor();
  };

  const saveCode = () => {
    storage.set(
      CodeStorageKey[CodeType.nodejs] + '_' + detail?.name,
      editorRef.current?.getEditor()?.getValue()
    );
  };

  const defaultCode = useMemo(() => {
    return (
      storage.get(CodeStorageKey[CodeType.nodejs] + '_' + detail?.name) ||
      detail?.template
    );
  }, [detail]);

  useEffect(() => {
    const editor = editorRef.current?.getEditor();
    if (editor && detail) {
      const debounceSaveCode = debounce(saveCode, autoSaveDelay * 1000);
      const saveCodeListen = editor
        ?.getModel()
        ?.onDidChangeContent(debounceSaveCode);

      return () => {
        saveCodeListen?.dispose();
        // 取消前一个 debounce
        debounceSaveCode.cancel();
      };
    }
  }, [autoSaveDelay, editorRef.current, detail]);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!name) return;
      const res = await getQuestion({ name });
      setDetail(res);
    };
    fetchQuestion();
  }, [name]);

  useEffect(() => {
    if (introduce === Introduce.question) {
      const dom = document.querySelector('#introduce-question');
      if (!dom) return;
      dom.innerHTML = marked(detail?.introduce || '');
      hljs.registerLanguage('javascript', javascript);
      hljs.highlightAll();
    } else if (introduce === Introduce.answer) {
      const dom = document.querySelector('#introduce-answer');
      if (!dom) return;
      dom.innerHTML = marked(detail?.answermd || '');
      hljs.registerLanguage('javascript', javascript);
      hljs.highlightAll();
    }
  }, [detail, introduce]);

  const handleSubmit = async () => {
    setSubmitLoading(true);
    try {
      const code = getEditor()?.getValue() || '';
      const res = await exec({ code, name: detail?.name || '' });
      setShowOutput(true);
      setOutput(parseConsoleOutput(res.output));
    } catch (error) {
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!detail) return <PageSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.introduce}>
        <div className={styles.title}>{title}</div>

        <Tabs<Introduce>
          className="my-5 py-2"
          tabs={[
            { label: '简介', value: Introduce.question },
            { label: '参考答案', value: Introduce.answer },
          ]}
          active={introduce}
          boxed
          size="md"
          onChange={(type) => setIntroduce(type)}
        />
        {introduce === Introduce.question && (
          <article
            id="introduce-question"
            className={classNames('prose prose-stine')}
          ></article>
        )}
        {introduce === Introduce.answer && (
          <article
            id="introduce-answer"
            className={classNames('prose prose-stine')}
          ></article>
        )}
      </div>

      <div className={styles.content}>
        <Editor
          ref={editorRef}
          className={styles.editor}
          theme={ThemeType['Visual Studio Dark']}
          language={languageMap[CodeType.nodejs]}
          code={defaultCode}
        />
        <div className={styles.operator}>
          <div className={styles.left}>
            <Button
              onClick={() => {
                setShowOutput(!showOutput);
              }}
            >
              {showOutput ? 'hide' : 'show'}
            </Button>
          </div>
          <div className={styles.right}>
            <Button
              type="primary"
              className="mr-2"
              onClick={() => {
                const code = getEditor()?.getValue();
                const formatCode = prettierCodeFormat(code || '');
                if (formatCode) {
                  getEditor()?.setValue(formatCode);
                } else {
                  getEditor()?.getAction('editor.action.formatDocument')?.run();
                }
              }}
            >
              format
            </Button>
            <Button onClick={handleSubmit} loading={submitLoading}>
              Submit
            </Button>
          </div>
        </div>
        {showOutput && (
          <div className={styles.output}>
            {output.map((str, index) => (
              <pre className="text-gray-800" key={index}>
                {str}
              </pre>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Question;
