import { useRef, useState } from 'react';
import { useEffect } from 'react';
import ProcessManager from './process-manager';

interface Props {
  onCodeFormatDone(result: string): void;
}

let clangFormatInstance = new ProcessManager('clang-format', 'clang-format');

clangFormatInstance.start();

function useClangFormat({ onCodeFormatDone }: Props) {
  const [clangFormat, setClangFormat] =
    useState<ProcessManager>(clangFormatInstance);

  const clangFormatRef = useRef<ProcessManager>();

  useEffect(() => {
    clangFormatInstance.workerReady = () => {
      setClangFormat(clangFormatInstance);
    };

    // @ts-ignore
    clangFormatInstance.workerFormatDone = (args) => {
      onCodeFormatDone(args?.result);
    };

    clangFormatRef.current = clangFormat;
  }, []);
  return [clangFormat];
}

export default useClangFormat;
