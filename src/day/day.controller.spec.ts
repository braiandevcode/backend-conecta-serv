import { Test, TestingModule } from '@nestjs/testing';
import { DayController } from './day.controller';
import { DayService } from './day.service';

describe('DayController', () => {
  let controller: DayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DayController],
      providers: [DayService],
    }).compile();

    controller = module.get<DayController>(DayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
