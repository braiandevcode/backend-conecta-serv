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

@Controller('api/v1/')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('profile/:idTasker')
  @UseGuards(AuthGuard('jwt'))
  async findOne(idTasker: string): Promise<{ mimeType: string; base64: string } | null> {
    return await this.profileService.findOneImageBase64(idTasker);
  }
}
