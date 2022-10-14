import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import codeRouter from './routes/code';

const app = new Koa();
app.use(bodyParser());
app.use(cors());

app.use(codeRouter.routes()).use(codeRouter.allowedMethods());

app.on('error', (err) => {
  console.error('server error', err);
});

app.listen(3000);
