import { Body, Post, JsonController } from 'routing-controllers';
import * as docker from '../docker';
import { CodeType } from '../utils/type';

interface IRunRequest {
  stdin?: string;
  code?: string;
  type?: CodeType;
}

@JsonController('/code')
export class CodeController {
  @Post('/run')
  async run(@Body() body: IRunRequest) {
    const { code, type, stdin = '' } = body;

    if (
      typeof code !== 'string' ||
      typeof type !== 'string' ||
      (stdin && typeof stdin !== 'string')
    ) {
      return {
        code: 1,
        message: '参数有误!',
      };
    }

    if (code.length > 500000 || stdin.length > 500000) {
      return {
        code: 1,
        message: '参数太长了!',
      };
    }

    let result = {};

    try {
      const output = await docker.run2({
        type,
        code,
        stdin,
      });
      result = {
        code: 0,
        data: output,
      };
    } catch (error) {
      result = {
        code: 1,
        message: JSON.stringify(error),
      };
    }
    return result;
  }
}
