import { Module } from '@nestjs/common';
import { WorkAreaService} from './workArea.service';
import { WorkAreaController } from './workArea.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkArea} from './entities/workArea.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([WorkArea]),
  SharedModule,
],
  controllers: [WorkAreaController],
  providers: [WorkAreaService],
  exports:[WorkAreaService]
})
export class WorkAreaModule {}
