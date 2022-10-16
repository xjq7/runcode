import Docker, { Container } from 'dockerode';
import dockerConfig from '../config/docker';
import { CodeEnv, CodeType, FileSuffix } from '../utils/type';

const docker = new Docker({
  ...dockerConfig,
});

interface CodeDockerOption {
  env: CodeEnv;
  shell: string;
  fileSuffix: FileSuffix;
}

const imageMap: Record<CodeType, CodeDockerOption> = {
  cpp: {
    env: CodeEnv.cpp,
    shell: 'g++ code.cpp -o code.out && ./code.out',
    fileSuffix: FileSuffix.cpp,
  },
  nodejs: {
    env: CodeEnv.nodejs,
    shell: 'node code.js',
    fileSuffix: FileSuffix.nodejs,
  },
  go: {
    env: CodeEnv.go,
    shell: 'go run code.go',
    fileSuffix: FileSuffix.go,
  },
  bash: {
    env: CodeEnv.bash,
    shell: 'bash code.sh',
    fileSuffix: FileSuffix.bash,
  },
  shell: {
    env: CodeEnv.shell,
    shell: 'bash code.sh',
    fileSuffix: FileSuffix.shell,
  },
  python3: {
    env: CodeEnv.python3,
    shell: 'python3 code.py',
    fileSuffix: FileSuffix.python3,
  },
};

export async function run({ type, code }: { type: CodeType; code: string }) {
  let removeContainer = () => {};

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
      { StopTimeout: 1 }
    );

    const output = data[0] || {};
    result.code = output?.StatusCode;

    const container: Container = data[1];

    removeContainer = () => container.remove();
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
      ''
    );

    let outputStringArr = outputString.split('%0A');
    if (outputStringArr.length > 200) {
      outputStringArr = outputStringArr
        .slice(0, 100)
        .concat(
          ['%0A', '...' + encodeURI('数据太多,已折叠'), '%0A'],
          outputStringArr.slice(outputStringArr.length - 100)
        );
    }

    result.output = outputStringArr.join('%0A');
    result.code = 0;
  } catch (error) {
    console.log(error);
  } finally {
    removeContainer();
  }
  return result;
}
