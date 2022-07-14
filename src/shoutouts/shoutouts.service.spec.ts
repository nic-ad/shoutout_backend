import { Test, TestingModule } from '@nestjs/testing';
import { ShoutoutsService } from './shoutouts.service';

describe('ShoutoutsService', () => {
  let service: ShoutoutsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShoutoutsService],
    }).compile();

    service = module.get<ShoutoutsService>(ShoutoutsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
