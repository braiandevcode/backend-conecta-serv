import { Controller, Get, UseGuards } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { AuthGuard } from '@nestjs/passport';
@Controller('api/v1')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get('experiences/:idTasker')
  @UseGuards(AuthGuard('jwt'))
  async findAllById(idTasker: string): Promise<{ mimeType:string, base64:string }[] | []> {
    return await this.experiencesService.findAllById(idTasker);
  }
}
