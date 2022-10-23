import * as monaco from 'monaco-editor';

// @ts-ignore
self.MonacoEnvironment = {
  getWorker(_: any, label: string) {
    if (label === 'typescript' || label === 'javascript') {
      return new Worker(window.location.origin + '/ts.worker.js?worker');
    }
    return new Worker(window.location.origin + '/editor.worker.js?worker');
  },
};

monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
