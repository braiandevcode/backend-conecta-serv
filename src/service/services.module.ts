import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports:[TypeOrmModule.forFeature([Service]),
  SharedModule,
],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports:[ServicesService]
})
export class ServicesModule {}
