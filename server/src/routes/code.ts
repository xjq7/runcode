import Router from 'koa-router';
import * as docker from '../docker';
import { CodeType } from '../utils/type';

const router = new Router({ prefix: '/code' });

export enum RunCodeStatus {
  success = 0,
  timeout = 1,
  error = 2,
}

interface IRunRequest {
  stdin?: string;
  code?: string;
  type?: CodeType;
}

router.post('/run', async (ctx) => {
  const body = (ctx.request.body as IRunRequest) ?? {};

  const { code, type, stdin = '' } = body;

  if (
    typeof code !== 'string' ||
    typeof type !== 'string' ||
    (stdin && typeof stdin !== 'string')
  ) {
    ctx.throw(400, '参数有误!');
    return;
  }

  if (code.length > 500000 || stdin.length > 500000) {
    ctx.throw(400, '参数太长了!');
    return;
  }

  try {
    const output = await docker.run2({
      type,
      code,
      stdin,
    });
    ctx.body = {
      code: 0,
      data: output,
    };
  } catch (error) {
    ctx.body = {
      code: 1,
      message: JSON.stringify(error),
    };
  }
});

export default router;
