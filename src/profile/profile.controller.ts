import {
  Controller,
  Get,
  Param,
  Delete,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { Profile } from './entities/profile.entity';

@Controller('api/v1/')
export class ProfileController {
  private readonly logger: Logger = new Logger(ProfileController.name);
  constructor(private readonly profileService: ProfileService) {}

  @Get('images/:idTasker')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('idTasker') idTasker: string): Promise<{ mimeType: string; base64: string } | null> {
    return await this.profileService.findOne(idTasker);
  }

  @Get()
  findAll() {
    return this.profileService.findAll();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
