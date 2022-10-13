import Docker, { Container } from 'dockerode';
import dockerConfig from '../config/docker';
import * as cpp from './cpp';
import { CodeEnv, CodeType, FileSuffix } from './type';

const env: string[] = ['cpp:11'];

const docker = new Docker({
  ...dockerConfig,
});

export async function init() {
  // const images = await docker.listImages();

  // const imagesSet = new Set<string>(
  //   images.reduce<string[]>((acc, cur) => {
  //     if (cur.RepoTags) {
  //       acc = acc.concat(cur.RepoTags);
  //     }
  //     return acc;
  //   }, [])
  // );

  // const notBuildEnv = env.filter((env) => !imagesSet.has(env));

  await Promise.all(
    env.map(async (env) => {
      if (env.includes('cpp')) {
        const version = env.split(':')[1];
        return await cpp.buildImage({ version });
      }
      return await Promise.resolve();
    })
  );
}

interface CodeDockerOption {
  env: CodeEnv;
  shell: string;
  fileSuffix: FileSuffix;
}

const imageMap: Record<CodeType, CodeDockerOption> = {
  cpp: {
    env: CodeEnv.cpp,
    shell: 'g++ code.cpp -o code.out && ./codeout',
    fileSuffix: FileSuffix.cpp,
  },
  nodejs: {
    env: CodeEnv.nodejs,
    shell: 'node code.js',
    fileSuffix: FileSuffix.nodejs,
  },
};

export async function run({ type, code }: { type: CodeType; code: string }) {
  let removeContainer = () => {};

  let Error = {
    output: '',
    code: 1,
    time: 0,
  };

  let result = Error;

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
