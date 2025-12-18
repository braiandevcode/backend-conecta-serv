import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ExperiencesService } from './experiences.service';
import { AuthGuard } from '@nestjs/passport';
import { TTaskerImage } from 'src/types/typeTaskerImage';
@Controller('api/v1')
export class ExperiencesController {
  constructor(private readonly experiencesService: ExperiencesService) {}

  @Get('experiences/:idTasker')
  @UseGuards(AuthGuard('jwt'))
  async findAllById(@Param('idTasker') idTasker: string): Promise<TTaskerImage[]> {
    return await this.experiencesService.findAllByIdBase64(idTasker);
  }

  // ELIMINAR UN RECURSO DE IMAGEN DE EXPERIENCIAS
  @Delete('experiences/:publicId')
  @UseGuards(AuthGuard('jwt'))
  async deleteImageExpById(@Param('publicId') publicId: string): Promise<void> {
    return await this.experiencesService.deleteImageExpById(publicId);
  }

  // PARA ELIMINAR SOLO EN MOMENTO DE REGISTRO EN CLOUDINARY
  @Delete('experiencesAvatar/:publicId')
  async deleteExperinecesPrev(@Param('publicId') publicId: string): Promise<void> {
    return await this.experiencesService.deleteExperiencesPrev(publicId);
  }
}
