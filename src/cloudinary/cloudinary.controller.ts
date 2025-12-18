import { Controller, Delete, Param } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';

@Controller('api/v1/')
export class CloudinaryController {
  constructor(private readonly cloudinaryService:CloudinaryService){}

 @Delete('avatar/:publicId')
 async deleteAvatarPrev(@Param('publicId') publicId:string):Promise<void> {
    return await this.cloudinaryService.delete(publicId);
  }

  @Delete('experiences/:publicId')
  async deleteExperiencesPrev(@Param('publicId') publicId:string):Promise<void>{
    return await this.cloudinaryService.delete(publicId);
  }
}
