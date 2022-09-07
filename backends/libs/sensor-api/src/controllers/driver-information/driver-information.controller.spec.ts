import { Test, TestingModule } from '@nestjs/testing';
import { DriverInformationController } from './driver-information.controller';

describe('DriverInformationController', () => {
  let controller: DriverInformationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverInformationController],
    }).compile();

    controller = module.get<DriverInformationController>(DriverInformationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
