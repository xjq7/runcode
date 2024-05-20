import { Body, Controller, Post } from '@nestjs/common';
import * as docker from 'src/docker';
import { CodeRunDto } from 'src/dto/code';

@Controller('code')
export class CodeController {
  @Post('/run')
  async run(@Body() body: CodeRunDto) {
    const { code, type, stdin = '' } = body;

    const output = await docker.run({
      type,
      code,
      stdin,
    });

    return output;
  }
}
