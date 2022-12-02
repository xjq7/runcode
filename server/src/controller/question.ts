import {
  Body,
  BodyParam,
  Get,
  JsonController,
  Post,
  Put,
  QueryParam,
  UseBefore,
} from 'routing-controllers';
import Container from 'typedi';
import logger from '../logger';
import { QuestionService } from '../service/question';
import { CodeEnv } from '../utils/type';
import { question } from '@prisma/client';
import { Pager } from '../type';
import { TokenMiddleware } from '../middleware/tokenMiddleware';

const questionService = Container.get(QuestionService);

@JsonController('/question')
export class QuestionController {
  @Post('/exec')
  async exec(@BodyParam('name') name: string, @BodyParam('code') code: string) {
    const questionRes = await questionService.getQuestion({ name });
    if (questionRes.code) return questionRes;
    const { test: testCode = '', answer } = questionRes?.data ?? {};

    const wrapCode = '\n' + decodeURI(code) + '\n' + 'EOF' + '\n';
    const wrapTestCode = '\n' + testCode + '\n' + 'EOF' + '\n';
    const wrapAnswerCode = '\n' + (answer ?? '') + '\n' + 'EOF' + '\n';
    let output;
    try {
      const container = await questionService.createContainer({
        env: CodeEnv.nodejs,
        cmd: `cat > answer.mjs << 'EOF' ${wrapCode} 
        cat > test.mjs << 'EOF' ${wrapTestCode} 
        cat > _answer.mjs << 'EOF' ${wrapAnswerCode} 
        ./node_modules/mocha/bin/mocha.js test.mjs -b
       `,
      });

      output = await questionService.getContainerOutput(container);
    } catch (error: any) {
      logger.error('/question/exec 执行出错 ' + JSON.stringify(error));
      return {
        code: 1,
        message: error.message,
      };
    }
    return {
      code: 0,
      data: {
        output,
      },
    };
  }

  @Get('/list')
  list(
    @QueryParam('keyword') keyword: string = '',
    @QueryParam('page') page: Pager['page'],
    @QueryParam('pageSize') pageSize: Pager['pageSize']
  ) {
    return questionService.getQuestions({ keyword, pager: { page, pageSize } });
  }

  @Get('/')
  getQuestion(@QueryParam('name', { required: true }) name: string) {
    return questionService.getQuestion({ name });
  }

  @Post('/')
  @UseBefore(TokenMiddleware)
  async createQuestion(@Body() body: Omit<question, 'id'>) {
    return await questionService.createQuestion(body);
  }

  @Put('/')
  @UseBefore(TokenMiddleware)
  async updateQuestion(@Body() body: Omit<question, 'id'>) {
    try {
      return await questionService.updateQuestion(body);
    } catch (error) {
      console.log(error);
    }
  }
}
