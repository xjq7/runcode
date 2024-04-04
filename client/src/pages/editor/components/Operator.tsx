import useRequest from 'ahooks/lib/useRequest';
import classnames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Dropdown, Radio, message } from 'antd';
import { template } from '~components/CodeEditorMonaco/const';
import useClangFormat from '~hooks/useClangFormat/useClangFormat';
import { parseConsoleOutput, OutputType } from '~utils/helper';
import { runCode } from '../service';
import { Input, Tooltip } from 'antd';
import debounce from 'lodash/debounce';
import storage from '~utils/storage';
import { CodeStorageKey } from '~constant/storage';
import styles from './operator.module.less';
import { editor } from 'monaco-editor';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import useWindowSize from 'react-use/lib/useWindowSize';
import EditorConfig from '~store/config/editor';
import { observer } from 'mobx-react-lite';

const { TextArea } = Input;

enum DisplayType {
  input,
  output,
}

const runCodeInterval = 2000;

interface Props {
  getEditor: () => editor.IStandaloneCodeEditor | null | undefined;
}

function Operator(props: Props) {
  const { getEditor } = props;

  const [editorConfig] = useState(() => EditorConfig);
  const { autoSaveDelay, codeType, outputType, setOutputType } = editorConfig;

  const inputRef = useRef('');
  const [display, setDisplay] = useState(DisplayType.output);
  const { data, run, loading } = useRequest(runCode, { manual: true });

  const [saveDisabled, setSaveDisabled] = useState(true);

  const termRef = useRef<Terminal>();

  const onCodeFormatDone = (result: string) => {
    getEditor()?.setValue(result);
  };

  const [isFormatReady, format] = useClangFormat({
    onCodeFormatDone,
  });

  const { width } = useWindowSize();

  const hiddenTerminalOutput = useMemo(() => width < 600, [width]);

  const output = useMemo(() => {
    let output = '';
    if (data?.code) {
      output = data?.message || '';
    } else {
      output = data?.output || '';
    }
    return parseConsoleOutput(output, outputType);
  }, [data, outputType]);

  useEffect(() => {
    if (hiddenTerminalOutput) {
      setOutputType(OutputType.plain);
    }
  }, [hiddenTerminalOutput]);

  useEffect(() => {
    if (outputType !== OutputType.terminal) return;
    var term = new Terminal({
      rows: 13,
      allowProposedApi: true,
      disableStdin: true,
    });
    term.loadAddon(new WebLinksAddon());
    term.open(document.querySelector('#terminal') as HTMLElement);
    termRef.current = term;
    return () => {
      term.dispose();
    };
  }, [outputType]);

  useEffect(() => {
    if (loading) {
      termRef.current?.reset();
      termRef.current?.write('running...');
      return;
    }
    if (outputType !== OutputType.terminal) return;
    termRef.current?.reset();
    termRef.current?.write(output.join('\n'));
  }, [output, outputType, loading]);

  const [timesPrevent, setTimesPrevent] = useState(false);

  const saveCode = () => {
    storage.set(CodeStorageKey[codeType], getEditor()?.getValue());
  };

  const handleRunCode = async () => {
    if (timesPrevent) {
      message.info('您点击太快啦! 请稍后重试!');
      return;
    }

    if (getEditor()) {
      const code = getEditor()?.getValue() || '';
      run({ code: encodeURI(code), type: codeType, stdin: inputRef.current });
      setTimesPrevent(true);
      setTimeout(() => {
        setTimesPrevent(false);
      }, runCodeInterval);
    }
  };
  useEffect(() => {
    if (loading) {
      setDisplay(DisplayType.output);
    }
  }, [loading]);

  useEffect(() => {
    const editor = getEditor();

    if (editor) {
      const debounceSaveCode = debounce(saveCode, autoSaveDelay * 1000);
      const saveCodeListen = editor
        ?.getModel()
        ?.onDidChangeContent(debounceSaveCode);
      const saveDisabledListen = editor?.getModel()?.onDidChangeContent(() => {
        setSaveDisabled(false);
      });
      return () => {
        saveCodeListen?.dispose();
        saveDisabledListen?.dispose();
        // 取消前一个 debounce
        debounceSaveCode.cancel();
      };
    }
  }, [codeType, getEditor, autoSaveDelay]);

  const renderInput = () => {
    return (
      <TextArea
        onChange={(e) => {
          inputRef.current = e.target.value;
        }}
        className={'w-full h-full mt-1'}
        style={{
          display: display === DisplayType.input ? 'block' : 'none',
          height: 231,
        }}
        placeholder="stdin..."
      />
    );
  };

  const renderOutput = () => {
    if (outputType === OutputType.terminal) {
      return (
        <div
          className={styles.terminal_container}
          style={{
            display: display === DisplayType.input ? 'none' : 'block',
          }}
        >
          <div id="terminal"></div>
        </div>
      );
    }
    return (
      <div
        className={classnames(styles.output, 'mt-1', 'text-gray-600')}
        style={{ display: display === DisplayType.output ? 'block' : 'none' }}
      >
        {loading ? (
          'running...'
        ) : output.length ? (
          output.map((str, index) => (
            <pre className="text-gray-800" key={index}>
              {str}
            </pre>
          ))
        ) : (
          <span className="text-sm text-gray-400">output...</span>
        )}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={classnames(styles.operator, 'pt-2')}>
        {!hiddenTerminalOutput && (
          <Dropdown
            menu={{
              items: [
                {
                  label: (
                    <div
                      onClick={() => {
                        setOutputType(OutputType.plain);
                      }}
                    >
                      plain
                    </div>
                  ),
                  key: OutputType.plain,
                },
                {
                  label: (
                    <div
                      onClick={() => {
                        setOutputType(OutputType.terminal);
                      }}
                    >
                      terminal
                    </div>
                  ),
                  key: OutputType.terminal,
                },
              ],
            }}
          >
            <Button size="large" type="primary" className="mr-2">
              终端样式
            </Button>
          </Dropdown>
        )}

        {isFormatReady && (
          <Button
            size="large"
            className="mr-2"
            onClick={() => {
              const code = getEditor()?.getValue() || '';
              format({ type: codeType, code });
            }}
          >
            格式化
          </Button>
        )}
        <Tooltip
          className="mr-2"
          title={`无需频繁保存, 代码变更 ${autoSaveDelay}s 后会自动保存`}
        >
          <Button
            size="large"
            disabled={saveDisabled}
            onClick={() => {
              saveCode();
              message.info('保存成功!');
              setSaveDisabled(true);
            }}
          >
            保存
          </Button>
        </Tooltip>

        <Button
          size="large"
          type="primary"
          className="mr-2"
          onClick={() => {
            getEditor()?.setValue(template[codeType]);
          }}
        >
          重置
        </Button>
        <Button
          size="large"
          type="primary"
          className="mr-2"
          loading={loading}
          onClick={handleRunCode}
        >
          运行
        </Button>
      </div>
      <div className={classnames(styles.display)}>
        <Radio.Group
          value={display}
          onChange={(e) => setDisplay(e.target.value)}
        >
          <Radio.Button value={DisplayType.input}>输入</Radio.Button>
          <Radio.Button value={DisplayType.output}>输出</Radio.Button>
        </Radio.Group>

        {renderInput()}
        {renderOutput()}
      </div>
    </div>
  );
}

export default observer(Operator);
