import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Welcome to the SSteP-KiZ Signalling Server!"', () => {
      expect(appController.getHello()).toBe(
        'Welcome to the SSteP-KiZ Signalling Server!',
      );
    });
  });
});
