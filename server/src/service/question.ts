import Docker, { Container } from 'dockerode';
import { Service } from 'typedi';
import dockerConfig from '../config/docker';
import { CodeEnv } from '../utils/type';
import { Stream } from 'stream';
import { DockerRunStatus } from '../docker';
import { isType } from '../utils/helper';
import questions from '../../questions.json';
import { Response } from '../type';

const docker = new Docker({
  ...dockerConfig,
});

const DockerRunConfig = {
  timeout: 6000,
};

interface Question {
  index: string;
  introduce: string;
  answer: string;
  test: string;
  name?: string;
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

  let outputStringArr = outputString.split('%0A');
  if (outputStringArr.length > 200) {
    outputStringArr = outputStringArr
      .slice(0, 100)
      .concat(
        ['%0A', '...' + encodeURI('数据太多,已折叠'), '%0A'],
        outputStringArr.slice(outputStringArr.length - 100)
      );
  }

  return outputStringArr.join('%0A');
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
        function (_err, stream?: Stream) {
          stream?.pipe(process.stdout);
        }
      );

      container?.wait((status) => {
        if (!status || status?.Status === DockerRunStatus.exited) {
          handleOutput();
        }
      });
    });
  }

  async getQuestion({ name }: { name: string }): Promise<Response<Question>> {
    const data = (questions as any)[name];
    return {
      code: 0,
      data: {
        ...data,
        name,
      },
    };
  }

  async getQuestions({ keyword }: { keyword: string }): Promise<any> {
    const data = Object.keys(questions)
      .filter((name) => (keyword ? name.includes(keyword) : true))
      .map((name) => ({ name, ...(questions as any)[name] }));
    return { code: 0, data: { list: data, pager: { total: data.length } } };
  }
}
