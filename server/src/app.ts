import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import * as docker from './docker';

const app = new Koa();
app.use(bodyParser());

const router = new Router();

router.post('/run', async (ctx, next) => {
  const body = ctx.request.body ?? {};

  const { code } = body;

  if (typeof code !== 'string') {
    ctx.throw();
    return;
  }

  const output = await docker.run({
    image: 'nodejs:16',
    code: '\n' + decodeURI(code) + '\n' + 'EOF' + '\n',
  });

  ctx.body = {
    code: 0,
    data: {
      output,
    },
  };
});

app.use(router.routes()).use(router.allowedMethods());

app.on('error', (err) => {
  console.error('server error211', err);
});

app.listen(3002);
