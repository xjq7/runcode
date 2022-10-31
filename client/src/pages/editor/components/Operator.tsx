import useRequest from 'ahooks/lib/useRequest';
import classnames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';
import Button from '~components/Button';
import { template } from '~components/CodeEditorMonaco/const';
import { toast } from '~components/Toast';
import useClangFormat from '~hooks/useClangFormat/useClangFormat';
import { CodeType } from '~utils/codeType';
import { parseConsoleOutput, saveAsFile, OutputType } from '~utils/helper';
import { runCode } from '../service';
import Tab from '~components/Tab';
import TextArea from '~components/Textarea';
import debounce from 'lodash/debounce';
import Tooltip from '~components/Tooltip';
import storage from '~utils/storage';
import { CodeStorageKey } from '~constant/storage';
import styles from './operator.module.less';
import { editor } from 'monaco-editor';
import { Terminal } from 'xterm';
import { WebLinksAddon } from 'xterm-addon-web-links';
import Dropdown, { Option } from '~components/Dropdown';
import useWindowSize from 'react-use/lib/useWindowSize';
import EditorConfig from '~store/config/editor';
import { observer } from 'mobx-react-lite';

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

  const [clangFormat] = useClangFormat({ onCodeFormatDone });

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

  const handleTerminalChange = (option: Option) => {
    setOutputType(option.value);
  };

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

  const showClangFormat = useMemo(
    () =>
      clangFormat &&
      (CodeType.cpp === codeType ||
        CodeType.java === codeType ||
        CodeType.c === codeType),
    [codeType, clangFormat]
  );

  const saveCode = () => {
    storage.set(CodeStorageKey[codeType], getEditor()?.getValue());
  };

  const handleRunCode = async () => {
    if (timesPrevent) {
      toast({ message: '您点击太快啦! 请稍后重试!', type: 'info' });
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
        border
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
            optionStyle="w-36"
            options={[
              { label: 'plain', value: OutputType.plain },
              { label: 'terminal', value: OutputType.terminal },
            ]}
            onChange={handleTerminalChange}
          >
            <Button className="mr-2">终端样式</Button>
          </Dropdown>
        )}

        {output.length !== 0 && (
          <Tooltip className="mr-2" tips="将运行输出保存到本地文件">
            <Button
              type="primary"
              size="sm"
              onClick={() => {
                if (!output) return;
                saveAsFile(output.join('\n'));
              }}
            >
              输出文件
            </Button>
          </Tooltip>
        )}
        {(codeType === CodeType.nodejs || showClangFormat) && (
          <Button
            type="primary"
            size="sm"
            className="mr-2"
            onClick={() => {
              if (codeType === CodeType.nodejs) {
                getEditor()?.getAction('editor.action.formatDocument')?.run();
              } else if (showClangFormat) {
                const code = getEditor()?.getValue();
                if (!code) return;
                clangFormat?.worker?.postMessage({
                  function: 'format',
                  code,
                });
              }
            }}
          >
            format
          </Button>
        )}
        <Tooltip
          className="mr-2"
          tips={`无需频繁保存, 代码变更 ${autoSaveDelay}s 后会自动保存`}
        >
          <Button
            type="primary"
            size="sm"
            disabled={saveDisabled}
            onClick={() => {
              saveCode();
              toast({ type: 'info', message: '保存成功!' });
              setSaveDisabled(true);
            }}
          >
            save
          </Button>
        </Tooltip>

        <Button
          type="primary"
          size="sm"
          className="mr-2"
          onClick={() => {
            getEditor()?.setValue(template[codeType]);
          }}
        >
          reset
        </Button>
        <Button
          type="primary"
          size="sm"
          className="mr-2"
          loading={loading}
          onClick={handleRunCode}
        >
          run
        </Button>
      </div>
      <div className={classnames(styles.display)}>
        <Tab<DisplayType>
          tabs={[
            { label: '输入', value: DisplayType.input },
            { label: '输出', value: DisplayType.output },
          ]}
          active={display}
          lifted
          size="md"
          onChange={(type) => setDisplay(type)}
        />

        {renderInput()}
        {renderOutput()}
      </div>
    </div>
  );
}

export default observer(Operator);
