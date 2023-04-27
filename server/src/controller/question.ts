import {
  BodyParam,
  Get,
  JsonController,
  Post,
  QueryParam,
} from 'routing-controllers';
import qss from '../../qs.json';
import logger from '../logger';
import { CodeEnv } from '../utils/type';
import Container from 'typedi';
import { QuestionService } from '../service/question';

const questionService = Container.get(QuestionService);

@JsonController('/question')
export class QuestionController {
  @Post('/exec')
  async exec(@BodyParam('name') name: string, @BodyParam('code') code: string) {
    const questionRes = qss.data;
    const qs = questionRes.find((o) => o.name === name);
    const { test: testCode = '', answer } = qs ?? {};

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
  async list() {
    return {
      code: 0,
      data: { list: qss.data },
    };
  }

  @Get('/')
  getQuestion(@QueryParam('name', { required: true }) name: string) {
    return {
      code: 0,
      data: qss.data.find((o) => o.name === name),
    };
  }
}
