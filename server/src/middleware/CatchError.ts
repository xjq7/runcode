import { Context, HttpError } from 'koa';

export const CatchError = async (ctx: Context, next: () => any) => {
  try {
    await next();
    if (ctx.status === 404) {
      throw new HttpError();
    }
  } catch (err: any) {
    ctx.body = {
      code: 2,
      message: `未知异常,${err.message}`,
    };
  }
};
