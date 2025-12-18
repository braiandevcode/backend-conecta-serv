import { Module } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { ExperiencesController } from './experiences.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Experience } from './entities/experience.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [TypeOrmModule.forFeature([Experience]),  CloudinaryModule],
  controllers: [ExperiencesController],
  providers: [ExperiencesService],
  exports:[ExperiencesService]
})
export class ExperiencesModule {}
