import { Body, Controller, Get, Logger, Post, Query } from '@nestjs/common';
import { ExecDto, getQuestDto } from 'src/dto/question';
import { QuestionService } from './question.service';
import { CodeEnv } from 'src/constants/code';
import * as fs from 'fs';
import * as path from 'path';

let qss = { data: [] };

try {
  qss = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../../qs.json'), 'utf8'),
  );
} catch (error) {
  console.log(error);
}

@Controller('question')
export class QuestionController {
  logger = new Logger();

  constructor(private questionService: QuestionService) {}

  @Post('/exec')
  async exec(@Body() body: ExecDto) {
    const questionRes = qss.data;
    const { name, code } = body;
    const qs = questionRes.find((o) => o.name === name);
    const { test: testCode = '', answer } = qs ?? {};

    const wrapCode = '\n' + decodeURI(code) + '\n' + 'EOF' + '\n';
    const wrapTestCode = '\n' + testCode + '\n' + 'EOF' + '\n';
    const wrapAnswerCode = '\n' + (answer ?? '') + '\n' + 'EOF' + '\n';

    const container = await this.questionService.createContainer({
      env: CodeEnv.nodejs,
      cmd: `cat > answer.mjs << 'EOF' ${wrapCode} 
        cat > test.mjs << 'EOF' ${wrapTestCode} 
        cat > _answer.mjs << 'EOF' ${wrapAnswerCode} 
        ./node_modules/mocha/bin/mocha.js test.mjs -b
       `,
    });

    const output = await this.questionService.getContainerOutput(container);

    return {
      output,
    };
  }

  @Get('/list')
  async list() {
    return { list: qss.data };
  }

  @Get('/')
  getQuestion(@Query() query: getQuestDto) {
    const { name } = query;
    return qss.data.find((o) => o.name === name);
  }
}
