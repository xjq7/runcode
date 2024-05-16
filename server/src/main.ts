import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import { ExceptionInterceptor } from './interceptor/exception.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ExceptionInterceptor());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
