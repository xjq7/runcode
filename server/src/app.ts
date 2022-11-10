import 'reflect-metadata';
import cors from '@koa/cors';
import logger from './logger';
import { createKoaServer } from 'routing-controllers';
import { CodeController } from './controller/code';
import { StatController } from './controller/stat';
import { QuestionController } from './controller/question';
import { CatchError } from './middleware/CatchError';

// @ts-ignore
// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = createKoaServer({
  controllers: [CodeController, StatController, QuestionController],
});

app.use(
  cors({
    origin: '*',
    allowHeaders: '*',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  })
);

app.use(CatchError);

app.on('error', (err: any) => {
  console.error('server error', err);
});

process.on('unhandledRejection', (err) => {
  console.log('unhandledRejection', err);
});

process.on('uncaughtException', (err) => {
  console.log('uncaughtException', err);
});

app.listen(39005, () => {
  logger.info('应用启动成功!');
});
