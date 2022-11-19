import { ForbiddenError, KoaMiddlewareInterface } from 'routing-controllers';
import dotenv from 'dotenv';
import { Context } from 'koa';
dotenv.config();

const { QS_TOKEN } = process.env;

export class TokenMiddleware implements KoaMiddlewareInterface {
  use(context: Context, next: (err?: any) => Promise<any>): Promise<any> {
    const qsToken = context.request.headers['qs-token'];

    if (qsToken !== QS_TOKEN || !QS_TOKEN) {
      return Promise.reject(new ForbiddenError('无权限访问!'));
    }
    return next();
  }
}
