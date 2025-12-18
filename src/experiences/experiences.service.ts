import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Experience } from './entities/experience.entity';
import { EntityManager, Repository } from 'typeorm';
import { ErrorManager } from 'src/config/ErrorMannager';
import { TTaskerImage } from 'src/types/typeTaskerImage';
import { ImageMetadataDto } from 'src/shared/dtos/image-dto';
import { ESeparatorsMsgErrors } from 'src/common/enums/enumSeparatorMsgErrors';
import { CreateExperienceDto } from './dto/create-experience.dto';
import { DeleteResult } from 'typeorm/browser';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ExperiencesService {
  private readonly logger: Logger = new Logger(ExperiencesService.name);
  constructor(
    @InjectRepository(Experience) private readonly imageExperienceRepo: Repository<Experience>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // CREAR IMAGENES
  async create(
    idTasker: string,
    imagesDto: CreateExperienceDto[],
    manager?: EntityManager,
  ): Promise<Experience[]> {
    const repo: Repository<Experience> = manager
      ? manager.getRepository(Experience)
      : this.imageExperienceRepo;

    // OBTENER TODOS LOS ORDERS EXISTENTES
    const existingImages: Experience[] = await repo.find({
      where: { tasker: { idTasker } },
      select: ['order'], // ==> TRAER SOLO LA COLUMNA ORDER (OPTIMIZACION)
    });

    this.logger.debug(existingImages);

    // DETERMINAR EL ORDEN MAS ALTO
    // CREA ARRAY DE TODOS LOS NUMEROS DE ORDER [1, 2, 3, 1]
    const orders: number[] = existingImages.map(img => img.order);

    this.logger.debug(orders);

    // CALCULAMOS EL ORDEN MAS ALTO
    const maxOrder = orders.length > 0 ? Math.max(...orders) : 0;

    this.logger.debug(maxOrder);

    // DEFINIMOS NUEVO ORDEN DEL INICIO
    // SI EL MAXIMO ES 3, currentOrder DEBERIA SER 4.SI ES 0 ENTONCES 1.
    let currentOrder: number = maxOrder + 1;

    this.logger.debug('ORDEN ACTUAL: ', currentOrder);

    const savedExperiences: Experience[] = []; //ACUMULADOR ARREGLO DE EXPERIENCIAS VACIO

    // ITERAMOS
    for (const dataImage of imagesDto) {
      // CREAR INSTANCIA EN DB
      const newExperience: Experience = repo.create({
        ...dataImage,
        order: currentOrder,
        tasker: { idTasker },
      });

      savedExperiences.push(newExperience);

      await repo.save(newExperience);
      currentOrder++; // => INCREMENTA A UNO
    }

    this.logger.debug('LO QUE RETORNA EL BUCLE: ', savedExperiences);

    return savedExperiences; // ==> RETORNAR
  }

  // BUSCAR IMAGENES POR ID
  async findAllByIdBase64(idTasker: string): Promise<TTaskerImage[] | []> {
    try {
      const imagesExp: Experience[] = await this.imageExperienceRepo.find({
        where: { tasker: { idTasker } },
      });

      this.logger.debug(imagesExp);

      // SI NO HAY LONGITUD
      if (imagesExp.length === 0) return [];

      // SINO MAPEAR
      const allImagesTaskerBase64 = imagesExp.map(
        img => ({ publicId: img.publicId, mimeType: img.type, url: img.url }) as TTaskerImage,
      );

      this.logger.debug(allImagesTaskerBase64);

      return allImagesTaskerBase64;
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // UNA IMAGEN DE EXPERIENCIA POR ID
  async getExperienceImageById(publicId: string): Promise<TTaskerImage | null> {
    try {
      const imageExp: Experience | null = await this.imageExperienceRepo.findOne({
        where: { publicId },
      });

      this.logger.debug(imageExp);

      if (!imageExp) return null;

      // OBJETO DE INFORMACION DE IMAGEN
      const imagesTasker = {
        publicId: imageExp.publicId,
        mimeType: imageExp.type,
        url: imageExp.url,
      } as TTaskerImage;

      this.logger.debug(imagesTasker);

      return imagesTasker;
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  // ELIMINAR IMAGEN POR PUBLIC ID
  async deleteImageExpById(publicId: string): Promise<void> {
    try {
      // BUSCAR PRIMERO
      const image: Experience | null = await this.imageExperienceRepo.findOne({ where: { publicId } });

      if (!image) {
        throw ErrorManager.createSignatureError(
          `BAD_REQUEST${ESeparatorsMsgErrors.SEPARATOR}No se encontró id para eliminar`,
        );
      }

      // ELIMINAR DE CLOUDINARY
      await this.cloudinaryService.delete(publicId);

      //ELIMINAR DE LA DB
      await this.imageExperienceRepo.delete({ publicId });
    } catch (error) {
      const err = error as HttpException;
      this.logger.error(err.message, err.stack);
      if (err instanceof ErrorManager) throw err;
      throw ErrorManager.createSignatureError(err.message);
    }
  }

  async deleteExperiencesPrev (publicId:string): Promise<void>{
    return await this.cloudinaryService.delete(publicId);
  }
}
