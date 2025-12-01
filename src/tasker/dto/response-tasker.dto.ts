import { ImageMetadataDto } from 'src/shared/dtos/image-dto';
import { Tasker } from '../entities/tasker.entity';
// ESTRUCTURA FINAL DE RESPUESTA DE TASKER
export interface TaskerResponse extends Tasker {
  profileImage: ImageMetadataDto | null; 
  experiencesImages: ImageMetadataDto[]; 
}
