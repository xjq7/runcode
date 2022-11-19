import 'reflect-metadata';
import logger from './logger';
import { createKoaServer } from 'routing-controllers';
import { CodeController } from './controller/code';
import { StatController } from './controller/stat';
import { QuestionController } from './controller/question';

// @ts-ignore
// eslint-disable-next-line no-extend-native
BigInt.prototype.toJSON = function () {
  return this.toString();
};

const app = createKoaServer({
  cors: true,
  controllers: [CodeController, StatController, QuestionController],
});

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
