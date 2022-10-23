class ProcessManager {
  name: string;
  moduleName: string;
  worker: Worker | null;
  wasmBinary: any;

  constructor(name: string, moduleName: string) {
    this.name = name;
    this.moduleName = moduleName;
    this.worker = null;
    this.wasmBinary = null;
    this.onWorkerError = this.onWorkerError.bind(this);
    this.onWorkerMessage = this.onWorkerMessage.bind(this);
  }

  postMessage(msg: { function: string; moduleName: string; wasmBinary: any }) {
    this.worker?.postMessage(msg);
  }

  setStatus(state: any, status: any) {
    console.log(this.name, 'state:', state, 'status:', status);
  }

  workerSetStatus({ state, status }: any) {
    this.setStatus(state, status);
  }

  onWorkerError(e: any) {
    if (e.currentTarget !== this.worker) return;
    console.log(this.name, 'error:', e);
    this.setStatus('error', 'Uncaught error; see log');
    this.terminate();
  }

  onWorkerMessage(e: any) {
    if (e.currentTarget != this.worker) return;
    // @ts-ignore
    this[e.data.function](e.data);
  }

  workerReady() {
    this.setStatus('ready', 'Ready');
  }

  workerSendStart() {
    this.postMessage({
      function: 'start',
      moduleName: this.moduleName,
      wasmBinary: this.wasmBinary,
    });
  }

  async start() {
    let worker;
    try {
      this.terminate();

      this.worker = worker = new Worker('process-clang-format.js', {
        name: this.name,
      });
      this.worker.onerror = this.onWorkerError;
      this.worker.onmessage = this.onWorkerMessage;

      if (!this.wasmBinary) {
        this.setStatus('init', 'Downloading ' + this.moduleName + '.wasm');
        let response = await fetch(
          'https://xjq-img.oss-cn-shenzhen.aliyuncs.com/runcode/clang-format/' +
            this.moduleName +
            '.wasm'
        );
        if (worker !== this.worker) return;
        if (!response.ok) {
          this.setStatus(
            'error',
            'Error downloading ' + this.moduleName + '.wasm'
          );
          return;
        }
        let wasmBinary = await response.arrayBuffer();
        if (worker !== this.worker) return;
        this.wasmBinary = wasmBinary;
      }

      this.setStatus('init', 'Downloading scripts');
      if (worker)
        this.postMessage({
          function: 'start',
          moduleName: this.moduleName,
          wasmBinary: this.wasmBinary,
        });
    } catch (e: any) {
      if (worker != this.worker) return;
      this.setStatus('error', e.message);
    }
  }

  terminate() {
    if (!this.worker) return;
    console.log(this.name, 'terminate');
    if (this.worker) this.worker.terminate();
    this.worker = null;
  }
} // class ProcessManager

export default ProcessManager;
