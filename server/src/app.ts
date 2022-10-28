import cors from '@koa/cors';
import logger from './logger';
import { createKoaServer } from 'routing-controllers';
import { CodeController } from './controller/code';
import 'reflect-metadata';

const app = createKoaServer({
  controllers: [CodeController],
});

app.use(
  cors({
    origin: '*',
    allowHeaders:
      'Access-Control-Allow-Headers, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization',
    allowMethods: 'GET,HEAD,PUT,POST,DELETE,PATCH,OPTIONS',
  })
);

app.on('error', (err: any) => {
  console.error('server error', err);
});

app.listen(39005, () => {
  logger.info('应用启动成功!');
});
