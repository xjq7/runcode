import Docker, { Container } from 'dockerode';
import { Service } from 'typedi';
import dockerConfig from '../config/docker';
import { CodeEnv } from '../utils/type';
import { Stream } from 'stream';
import { DockerRunStatus } from '../docker';
import { isType } from '../utils/helper';

const docker = new Docker({
  ...dockerConfig,
});

const DockerRunConfig = {
  timeout: 6000,
};

function formatOutput(outputString: string): string {
  outputString = outputString.replace(/AssertionError: /g, '');
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

  let outputStringArr = outputString.split(/\r\n|\n/);

  if (outputStringArr.length > 200) {
    outputStringArr = outputStringArr
      .slice(0, 100)
      .concat(
        ['\n', '...' + '数据太多,已折叠', '\n'],
        outputStringArr.slice(outputStringArr.length - 100),
      );
  }

  return outputStringArr.join('\n');
}

@Service()
export class QuestionService {
  async createContainer({ env, cmd }: { env: CodeEnv; cmd: string }) {
    return await docker.createContainer({
      Image: env,
      Cmd: ['bash', '-c', cmd],
      StopTimeout: 6,
      Tty: true,
      AttachStdout: true,
      NetworkDisabled: true,
    });
  }

  async getContainerOutput(container: Container) {
    const removeContainer = () => {
      return container.remove({ force: true });
    };

    await container.start();

    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        removeContainer();
        reject(new Error());
      }, DockerRunConfig.timeout);

      const handleOutput = async () => {
        let outputString: any = await container?.logs({
          stdout: true,
          stderr: true,
        });

        if (Buffer.isBuffer(outputString)) {
          outputString = outputString.toString('utf-8');
        }
        outputString = formatOutput(outputString);
        resolve(outputString);
      };

      container?.attach(
        { stream: true, stdout: true, stderr: true },
        function (_err, stream) {
          stream?.pipe(process.stdout as any);
        },
      );

      container?.wait((status) => {
        if (!status || status?.Status === DockerRunStatus.exited) {
          handleOutput();
        }
      });
    });
  }
}
