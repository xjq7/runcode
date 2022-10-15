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
};

export async function run({ type, code }: { type: CodeType; code: string }) {
  let removeContainer = () => {};

  const Error = {
    output: '',
    code: 1,
    time: 0,
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
      process.stdout
    );

    const output = data[0] || {};
    result.code = output?.StatusCode;

    const container: Container = data[1];
    removeContainer = () => container.remove();
    const readstream: any = await container.logs({
      stdout: true,
      stderr: true,
    });

    result.output = encodeURI(readstream.toString('utf8'));
    result.code = 0;
  } catch (error) {
  } finally {
    removeContainer();
  }
  return result;
}
