import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { AuthGuard } from '@nestjs/passport';
@Controller('api/v1')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get('experiences/:idTasker')
  @UseGuards(AuthGuard('jwt'))
  async findAllById(@Param('idTasker') idTasker: string): Promise<{ mimeType: string; base64: string }[] | []> {
    return await this.experiencesService.findAllByIdBase64(idTasker);
  }

  // ELIMINAR UN RECURSO DE IMAGEN DE EXPERIENCIAS
  @Delete('experiences/:idExperience')
  @UseGuards(AuthGuard('jwt'))
  async deleteImageExpById(@Param('idExperience') idExperience: string):Promise<void> {
    return await this.experiencesService.deleteImageExpById(idExperience);
  }

  
}
