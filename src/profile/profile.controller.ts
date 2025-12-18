import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { AuthGuard } from '@nestjs/passport';
import { TTaskerImage } from 'src/types/typeTaskerImage';

@Controller('api/v1/')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('profile/:idTasker')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('idTasker') idTasker: string): Promise<TTaskerImage | null> {
    return await this.profileService.findOneImageProfile(idTasker);
  }

  @Delete('avatar/:publicId')
  async deleteAvatarPrev(@Param('publicId') publicId: string): Promise<void> {
    return await this.profileService.deleteAvatarPrev(publicId);
  }
}
