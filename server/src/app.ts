import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import codeRouter from './routes/code';

const app = new Koa();
app.use(bodyParser());

app.use(
  cors({
    origin: '*',
    allowHeaders:
      'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  })
);

app.use(codeRouter.routes()).use(codeRouter.allowedMethods());

app.on('error', (err) => {
  console.error('server error', err);
});

app.listen(3000);
