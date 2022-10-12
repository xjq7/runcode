import Koa from 'koa';
import Router from 'koa-router';

const app = new Koa();

const router = new Router();

router.get('/', (ctx, next) => {
  // ctx.router available
});

app.use(router.routes()).use(router.allowedMethods());

app.on('error', (err) => {
  console.error('server error', err);
});

app.listen(3000);
