import { Test, TestingModule } from '@nestjs/testing';
import { CleanRefreshTokenCronService } from './clean-refresh-token-cron.service';

describe('CleanRefreshTokenCronService', () => {
  let service: CleanRefreshTokenCronService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CleanRefreshTokenCronService],
    }).compile();

    service = module.get<CleanRefreshTokenCronService>(CleanRefreshTokenCronService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
