import { Controller, Body, Patch, Param, Delete, Get, UseGuards } from '@nestjs/common';
import { TaskersService } from './taskers.service';
import { UpdateTaskerDto } from './dto/update-tasker.dto';
import { Profile } from 'src/profile/entities/profile.entity';
import { AuthGuard } from '@nestjs/passport';
import { Experience } from 'src/experiences/entities/experience.entity';
import { TTaskerImage } from 'src/types/typeTaskerImage';

@Controller('api/v1/')
export class TaskersController {
  constructor(private readonly taskerService: TaskersService) {}

  @Get('tasker/profile/:idTasker/image')
  @UseGuards(AuthGuard('jwt'))
  async getProfileImag(@Param('idTasker') idTasker: string): Promise<TTaskerImage | null> {
    return this.taskerService.getProfileImage(idTasker);
  }

  @Get('tasker/experience/:idExperience/image')
  @UseGuards(AuthGuard('jwt'))
  async getSingleExperienceImage(@Param('idExperience') idExperience: string): Promise<TTaskerImage | null> {
    // DELEGAR
    return await this.taskerService.getSingleExperienceImage(idExperience);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskerDto: UpdateTaskerDto) {
    return this.taskerService.update(+id, updateTaskerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taskerService.remove(+id);
  }
}
