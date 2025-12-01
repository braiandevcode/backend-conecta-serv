import { Test, TestingModule } from '@nestjs/testing';
import { WorkAreaController } from './workArea.controller';
import { WorkAreaService  } from './workArea.service';

describe('WorkAreaController', () => {
  let controller: WorkAreaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkAreaController],
      providers: [WorkAreaService],
    }).compile();

    controller = module.get<WorkAreaController>(WorkAreaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
