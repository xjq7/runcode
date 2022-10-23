import { useRef, useState } from 'react';
import { useEffect } from 'react';
import ProcessManager from './process-manager';

interface Props {
  onCodeFormatDone(result: string): void;
}

function useClangFormat({ onCodeFormatDone }: Props) {
  const [clangFormat, setClangFormat] = useState<ProcessManager>();

  const clangFormatRef = useRef<ProcessManager>();

  useEffect(() => {
    let clangFormat = new ProcessManager('clang-format', 'clang-format');

    clangFormat.start();
    clangFormat.workerReady = () => {
      setClangFormat(clangFormat);
    };

    // @ts-ignore
    clangFormat.workerFormatDone = (args) => {
      onCodeFormatDone(args?.result);
    };

    clangFormatRef.current = clangFormat;
  }, []);
  return [clangFormat];
}

export default useClangFormat;
