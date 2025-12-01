import { Module } from '@nestjs/common';
import { HourService } from './hour.service';
import { HourController } from './hour.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hour } from './entities/hour.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([Hour]), SharedModule],
  controllers: [HourController],
  providers: [HourService],
  exports: [HourService],
})
export class HourModule {}
