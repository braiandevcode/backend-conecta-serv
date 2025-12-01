import { Test, TestingModule } from '@nestjs/testing';
import { WorkAreaService } from './workArea.service';

describe('WorkAreaService', () => {
  let service: WorkAreaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkAreaService],
    }).compile();

    service = module.get<WorkAreaService>(WorkAreaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
