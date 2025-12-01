import { Test, TestingModule } from '@nestjs/testing';
import { HourController } from './hour.controller';
import { HourService } from './hour.service';

describe('HourController', () => {
  let controller: HourController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HourController],
      providers: [HourService],
    }).compile();

    controller = module.get<HourController>(HourController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
