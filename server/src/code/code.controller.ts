import { Body, Controller, Post } from '@nestjs/common';
import * as docker from 'src/docker';
import { CodeRunDto } from 'src/dto/code';

@Controller('code')
export class CodeController {
  @Post('/run')
  async run(@Body() body: CodeRunDto) {
    const { code, type, stdin = '' } = body;

    let result = {};

    try {
      const output = await docker.run({
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
