import {
  BodyParam,
  Get,
  JsonController,
  Post,
  QueryParam,
} from 'routing-controllers';
import Container from 'typedi';
import { QuestionService } from '../service/question';
import { CodeEnv } from '../utils/type';

const questionService = Container.get(QuestionService);

@JsonController('/question')
export class QuestionController {
  @Post('/exec')
  async exec(@BodyParam('name') name: string, @BodyParam('code') code: string) {
    const question = (await questionService.getQuestion({ name })) || {};

    const {
      data: { test: testCode = '', answer },
    } = question;

    const wrapCode = '\n' + decodeURI(code) + '\n' + 'EOF' + '\n';
    const wrapTestCode = '\n' + testCode + '\n' + 'EOF' + '\n';
    const wrapAnswerCode = '\n' + answer + '\n' + 'EOF' + '\n';
    let output;
    try {
      const container = await questionService.createContainer({
        env: CodeEnv.nodejs,
        cmd: `cat > index.mjs << 'EOF' ${wrapCode} 
        cat > test.mjs << 'EOF' ${wrapTestCode} 
        cat > answer.mjs << 'EOF' ${wrapAnswerCode} 
        node test.mjs
       `,
      });

      output = await questionService.getContainerOutput(container);
      console.log(output);
    } catch (error) {
      console.log(error);
    }
    return {
      code: 0,
      data: {
        output,
      },
    };
  }

  @Get('/list')
  async list(@QueryParam('keyword') keyword: string = '') {
    return await questionService.getQuestions({ keyword });
  }

  @Get('/')
  async getQuestion(@QueryParam('name', { required: true }) name: string) {
    return await questionService.getQuestion({ name });
  }

  async create() {
    // const data = {};
    // return await questionService.createQuestion(data);
  }
}
