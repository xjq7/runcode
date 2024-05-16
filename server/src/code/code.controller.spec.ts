import { Test, TestingModule } from '@nestjs/testing';
import { CodeController } from './code.controller';

describe('CodeController', () => {
  let controller: CodeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodeController],
    }).compile();

    controller = module.get<CodeController>(CodeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
