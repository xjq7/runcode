import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ExceptionInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        // class-validator 异常处理
        if (err instanceof BadRequestException) {
          const errResponse = err.getResponse();

          if (typeof errResponse === 'string') {
            return Promise.resolve({ code: 2, message: errResponse });
          }
          const { message } = errResponse as Record<string, any>;
          let msg = message;
          if (Array.isArray(message)) {
            msg = message[0];
          }

          return Promise.resolve({ code: 2, message: msg });
        }

        return Promise.resolve({ code: 1, message: err.message });
      }),
    );
  }
}
