import { Test, TestingModule } from '@nestjs/testing';
import { GameLogicController } from './game-logic.controller';

describe('GameLogic Controller', () => {
  let controller: GameLogicController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameLogicController],
    }).compile();

    controller = module.get<GameLogicController>(GameLogicController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
