import Router from 'koa-router';
import * as docker from '../docker';
import { CodeType } from '../docker/type';

const router = new Router({ prefix: '/code' });

router.post('/run', async (ctx) => {
  const body = ctx.request.body ?? {};

  const { code, type } = body;

  if (typeof code !== 'string' || typeof type !== 'string') {
    ctx.throw(400, '参数有误!');
    return;
  }

  const wrapCode = '\n' + decodeURI(code) + '\n' + 'EOF' + '\n';

  const output = await docker.run({
    type: type as CodeType,
    code: wrapCode,
  });

  ctx.body = {
    code: 0,
    data: output,
  };
});

export default router;
