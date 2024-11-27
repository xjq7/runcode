import Docker, { Container } from 'dockerode';
import { Stream } from 'stream';
import dockerConfig from '../config/docker';
import { CodeEnv, CodeType, FileSuffix } from '../utils/type';
import { isType } from '../utils/helper';
import logger from '../logger';

export enum RunCodeStatus {
  success = 0,
  timeout = 1,
  error = 2,
}

const DockerRunConfig = {
  timeout: 6000,
};

export enum DockerRunStatus {
  running = 'running',
  exited = 'exited',
}

const docker = new Docker({
  ...dockerConfig,
});

interface CodeDockerOption {
  env: CodeEnv;
  shell: string;
  fileSuffix: FileSuffix;
  shellWithStdin: string;
  prefix?: string;
}

const imageMap: Record<CodeType, CodeDockerOption> = {
  cpp: {
    env: CodeEnv.cpp,
    shell: 'g++ code.cpp -o code.out && ./code.out',
    shellWithStdin: 'g++ code.cpp -o code.out && ./code.out < input.txt',
    fileSuffix: FileSuffix.cpp,
  },
  nodejs: {
    env: CodeEnv.nodejs,
    shell: 'node code.js',
    shellWithStdin: 'node code.js < input.txt',
    fileSuffix: FileSuffix.nodejs,
  },
  go: {
    env: CodeEnv.go,
    shell: 'go run code.go',
    shellWithStdin: 'go run code.go < input.txt',
    fileSuffix: FileSuffix.go,
  },
  python2: {
    env: CodeEnv.python2,
    shell: 'python code.py',
    shellWithStdin: 'python code.py input.txt',
    fileSuffix: FileSuffix.python2,
  },
  python3: {
    env: CodeEnv.python3,
    shell: 'python3 code.py',
    shellWithStdin: 'python3 code.py input.txt',
    fileSuffix: FileSuffix.python3,
    prefix: `def expand_arg_files():
    import sys
    args = []
    if len(sys.argv) < 2:
        return
    with open(file=sys.argv[1], mode="r", encoding="utf-8") as f:
        line = f.readline()
        while line:
            args.append(line.strip())
            line = f.readline()
    sys.argv[1:] = args


expand_arg_files()
`,
  },
  java: {
    env: CodeEnv.java,
    shell: 'javac Code.java && java Code',
    shellWithStdin: 'javac Code.java && java Code < input.txt',
    fileSuffix: FileSuffix.java,
  },
  php: {
    env: CodeEnv.php,
    shell: 'php code.php',
    shellWithStdin: 'php code.php < input.txt',
    fileSuffix: FileSuffix.php,
  },
  rust: {
    env: CodeEnv.rust,
    shell: 'rustc code.rs && ./code',
    shellWithStdin: 'rustc code.rs && ./code < input.txt',
    fileSuffix: FileSuffix.rust,
  },
  c: {
    env: CodeEnv.c,
    shell: 'g++ code.c -o code.out && ./code.out',
    shellWithStdin: 'g++ code.c -o code.out && ./code.out < input.txt',
    fileSuffix: FileSuffix.c,
  },
  dotnet: {
    env: CodeEnv.dotnet,
    shell: 'mcs -out:code.exe code.cs && mono code.exe',
    shellWithStdin: 'mcs -out:code.exe code.cs && mono code.exe < input.txt',
    fileSuffix: FileSuffix.dotnet,
  },
  typescript: {
    env: CodeEnv.ts,
    shell: './node_modules/typescript/bin/tsc code.ts && node code.js',
    shellWithStdin:
      './node_modules/typescript/bin/tsc code.ts && node code.js < input.txt',
    fileSuffix: FileSuffix.ts,
  },
};

export async function run2(params: {
  type: CodeType;
  code: string;
  stdin: string;
}) {
  const Error = {
    output: '',
    code: RunCodeStatus.error,
    time: 0,
    message: '',
  };

  const result = Error;

  const { code, type, stdin } = params;

  const dockerOptions = imageMap[type];

  if (!dockerOptions) return Error;

  const { env, prefix = '', shell, shellWithStdin, fileSuffix } = dockerOptions;

  let removeContainer = () => {};

  const wrapCode = '\n' + prefix + decodeURI(code) + '\n' + 'EOF' + '\n';
  const wrapStdin = '\n' + decodeURI(stdin || '') + '\n' + 'EOF' + '\n';

  let bashCmd = `cat > code.${fileSuffix} << 'EOF' ${wrapCode}`;

  if (type === CodeType.java) {
    bashCmd = `cat > Code.${fileSuffix} << 'EOF' ${wrapCode}`;
  }

  if (stdin) {
    bashCmd += `cat > input.txt << EOF ${wrapStdin}
    ${shellWithStdin}`;
  } else {
    bashCmd += `${shell}`;
  }

  return await new Promise((resolve, reject) => {
    docker.createContainer(
      {
        Image: env,
        Cmd: ['bash', '-c', bashCmd],
        StopTimeout: 6,
        Tty: true,
        AttachStdout: true,
        NetworkDisabled: true,
      },
      function (_err, container?: Container) {
        if (_err) reject(_err);
        removeContainer = async () => {
          try {
            await container?.remove({ force: true });
          } catch (error) {}
        };

        container?.start((_err) => {
          if (_err) {
            removeContainer();
            reject(_err);
          }
          const handleOutput = async () => {
            try {
              let outputString: any = await container?.logs({
                stdout: true,
                stderr: true,
              });

              if (Buffer.isBuffer(outputString)) {
                outputString = outputString.toString('utf-8');
              }
              outputString = formatOutput(outputString);

              const containerInfo = await container?.inspect();
              const isRunning = containerInfo.State.Running;

              const isTimeout = !!isRunning;

              if (isTimeout) {
                result.code = RunCodeStatus.timeout;
                result.message = '执行时间超时!';
              } else {
                result.code = RunCodeStatus.success;
                result.output = outputString;
              }
            } catch (error) {
              logger.error(
                'docker runner output handle error' + JSON.stringify(error),
              );
              removeContainer();
              reject(error);
            } finally {
              removeContainer();
              resolve(result);
            }
          };

          container?.attach(
            { stream: true, stdout: true, stderr: true },
            function (_err: any, stream: any) {
              stream?.pipe(process.stdout as any);
            },
          );

          const timeoutSig = setTimeout(handleOutput, DockerRunConfig.timeout);

          container?.wait((status) => {
            if (!status || status?.Status === DockerRunStatus.exited) {
              clearTimeout(timeoutSig);
              handleOutput();
            }
          });
        });
      },
    );
  });
}

function formatOutput(outputString: string): string {
  if (outputString.length > 8200) {
    outputString =
      outputString.slice(0, 4000) +
      outputString.slice(outputString.length - 4000);
  }

  // hack 当遇到数组跟对象时, toString 方法的输出会是 {} => [object Object] [1,2] => 1,2
  // https://github.com/xjq7/runcode/issues/4
  if (isType('Object', 'Array')(outputString)) {
    outputString = JSON.stringify(outputString);
  }

  if (typeof outputString !== 'string') {
    outputString = String(outputString);
  }

  let outputStringArr = outputString.split('%0A');

  if (outputStringArr.length > 200) {
    outputStringArr = outputStringArr
      .slice(0, 100)
      .concat(
        ['%0A', '...' + encodeURI('数据太多,已折叠'), '%0A'],
        outputStringArr.slice(outputStringArr.length - 100),
      );
  }

  return outputStringArr.join('%0A');
}

export async function run({ type, code }: { type: CodeType; code: string }) {
  const Error = {
    output: '',
    code: 1,
    time: 0,
    message: '',
  };

  const result = Error;

  const dockerOptions = imageMap[type];

  if (!dockerOptions) return Error;

  const { env, shell, fileSuffix } = dockerOptions;

  try {
    const data = await docker.run(
      env,
      [
        'bash',
        '-c',
        `cat > code.${fileSuffix} << EOF ${code} \
        ${shell}`,
      ],
      process.stdout,
      { StopTimeout: 5 },
    );

    const output = data[0] || {};
    result.code = output?.StatusCode;

    const container: Container = data[1];
    const readstream: any = await container.logs({
      stdout: true,
      stderr: true,
    });

    let outputString = readstream.toString('utf8') as string;

    if (outputString.length > 4200) {
      outputString =
        outputString.slice(0, 2000) +
        outputString.slice(outputString.length - 2000);
    }

    outputString = encodeURI(outputString);

    outputString = outputString.replace(
      /%1B%5B.*?m.*?%1B%5BK|%1B%5B.*?m|%0D/g,
      '',
    );

    let outputStringArr = outputString.split('%0A');
    if (outputStringArr.length > 200) {
      outputStringArr = outputStringArr
        .slice(0, 100)
        .concat(
          ['%0A', '...' + encodeURI('数据太多,已折叠'), '%0A'],
          outputStringArr.slice(outputStringArr.length - 100),
        );
    }

    result.output = outputStringArr.join('%0A');
    result.code = 0;
  } catch (error) {
    console.log(error);
  }
  return result;
}
