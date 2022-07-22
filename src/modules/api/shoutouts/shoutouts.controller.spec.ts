import { Test, TestingModule } from '@nestjs/testing';
import { ShoutoutsController } from './shoutouts.controller';

describe('ShoutoutsController', () => {
  let controller: ShoutoutsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShoutoutsController],
    }).compile();

    controller = module.get<ShoutoutsController>(ShoutoutsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
