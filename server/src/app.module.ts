import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CodeController } from './code/code.controller';
import { CodeModule } from './code/code.module';
import { QuestionModule } from './question/question.module';

@Module({
  imports: [CodeModule, QuestionModule],
  controllers: [AppController, CodeController],
  providers: [AppService],
})
export class AppModule {}
