import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, Logger, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
// import { UpdateProfileDto } from './dto/update-profile.dto';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { multerOptions } from 'src/shared/multer.options';

@Controller('profile')
export class ProfileController {
  private readonly logger:Logger = new Logger(ProfileController.name)
  constructor(private readonly profileService: ProfileService) {}

  // @Post()
  // create(@Body() createProfileDto: CreateProfileDto) {
  //   return this.profileService.create(createProfileDto);
  // }

  @Get()
  findAll() {
    return this.profileService.findAll();
  }

  // @Post('debug')
  // @UseInterceptors(FileInterceptor('testFile', multerOptions))
  // debugUpload(@UploadedFile() file: Express.Multer.File) {
  //   this.profileService.debugUpload(file);
  // }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.profileService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProfileDto: UpdateProfileDto) {
  //   return this.profileService.update(+id, updateProfileDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.profileService.remove(+id);
  }
}
