import { Module } from '@nestjs/common';
import { TaskersController } from './taskers.controller';
import { TaskersService } from './taskers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tasker } from './entities/tasker.entity';
import { ServicesModule } from 'src/service/services.module';
import { HourModule } from 'src/hour/hour.module';
import { DayModule } from 'src/day/day.module';
import { BudgetModule } from 'src/budget/budget.module';
import { WorkAreaModule } from 'src/work-area/workArea.module';
import { CategoryModule } from 'src/category/category.module';
import { ProfileModule } from 'src/profile/profile.module';
import { ExperiencesModule } from 'src/experiences/experiences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tasker]),
    BudgetModule,
    CategoryModule,
    ProfileModule,
    ExperiencesModule,
    ServicesModule,
    WorkAreaModule,
    HourModule,
    DayModule,
  ],
  controllers: [TaskersController],
  providers: [TaskersService],
  exports: [TaskersService],

})
export class TaskersModule {}
